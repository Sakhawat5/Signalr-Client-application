import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { parse } from 'path';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {


  constructor(private service: UserService, private router: Router) { }
  
  Users : any[]=[]

  messages : any[]=[];
  message !: string;
  hubConnection !: HubConnection;
  
  UserID=this.service.UserID
  UserConnectionID: any
  UsersFullName !: any[];
  UsersConnectionId !: any[]
  selectedUser:number =0
  sender: any
  connectedUsers : any[] = []
  ngOnInit(): void {

    this.message=''
    this.hubConnection = new HubConnectionBuilder().withUrl("http://localhost:54277/chathub").build();
    const self = this
    this.hubConnection.start()
    .then(()=>{
      self.hubConnection.invoke("OnConnect",this.UserID,this.service.FirstName, this.service.LastName,this.service.UserN)
      .then(()=>{
        console.log('User Sent Successfully')
      })
      .catch(err => {
        console.error(err)
      });

      this.hubConnection.on("OnConnect",Usrs=>
      {
        this.UsersConnectionId = Object.keys(Usrs).map((index) => Usrs[index].connectionId)
        this.UsersFullName = Object.keys(Usrs).map((index) => Usrs[index].firstName +' '+ Usrs[index].lastName)

        this.connectedUsers = Usrs
      // this.usersss = Object.keys(Usrs).map((index) => { return {fullName:Usrs[index].fullName,connectionId:Usrs[index].connectionId}})


        this.Users=Usrs
      })
      this.hubConnection.on("OnDisconnect",Usrs=>{
        this.UsersConnectionId = Object.keys(Usrs).map((index) => Usrs[index].connectionId)
        this.UsersFullName = Object.keys(Usrs).map((index) => Usrs[index].firstName +' '+ Usrs[index].lastName)  
        this.Users=Usrs
      })
    })
    .catch(err => {
      console.log(err)
    });
    
    this.hubConnection.on("UserConnected", (connectionId) =>this.UserConnectionID=connectionId);

    this.hubConnection.on('receiveMessageAll', (connectionId ,message) => {
      var connectionUser = this.connectedUsers.find(it => it.connectionId === connectionId);
      this.messages.push({user : connectionUser.firstName +' '+ connectionUser.lastName, message})
    })
    
    this.hubConnection.on('ReceiveDM', (connectionId,message) => {
      var connectionUser = this.connectedUsers.find(it => it.connectionId === connectionId);
      this.messages.push({user : connectionUser.firstName +' '+ connectionUser.lastName, message})
       //this.messages.push(message)
      // this.sender=UserFullName
    })

  }
  SelectedId(event: any){
    if(event){
      this.selectedUser=event
    }
  }


  SendMessage(){
    if(this.selectedUser==0)
    this.SendMessageToAll()
    else
    this.SendDirectMessage(this.selectedUser)
  }
 
  SendMessageToAll(){
    if(this.message!='' && this.message.trim()!='')
    {
      this.hubConnection.invoke('SendMessageToAll',this.message)
      .then(()=>console.log('Message Sent Successfully'))
      .catch(err => console.error(err));
      this.message='';
    }
  }

  SendDirectMessage(ind : number){
    if(this.message!='' && this.message.trim()!='')
    {
    var cnxid =this.UsersConnectionId[ind-1]
    console.log(cnxid)
    this.hubConnection.invoke('SendMessageToUser',cnxid,this.message)
    .then(()=>console.log('Message to user Sent Successfully'))
    .catch(err => console.error(err));
    this.message='';
    }
  }

  onLogout() {
      this.hubConnection.invoke("RemoveOnlineUser",this.UserID)
      .then(()=>{
        this.messages.push('User Disconnected Successfully')
      })
      .catch(err => console.error(err));
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);  
  }

}
