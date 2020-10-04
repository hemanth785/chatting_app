import React from 'react';
import './App.css';
import Axios from 'axios';


const api_base_url = process.env.REACT_APP_API_BASE_URL;
class MainContainer extends React.Component {
    constructor(){
        super();
        this.state = {
            userData : [],
            recipentList : [],
            user : {},
            recipient : {},
            showSelectUser : true,
            showSelectRecipeint : false,
            showChatBox : false
        }
    }
    handleSelectedUser = (selecte_user) => {
        this.setState({user : selecte_user,
            recipentList: this.state.userData.filter((user) => {
                return selecte_user._id !== user._id;
            }),
            showSelectUser: false,
            showSelectRecipeint: true
        });
    }
    handleSelectedRecipient = (recipient) => {
        console.log("hello123")
        this.setState({recipient : recipient,
            showSelectRecipeint: false,
            showChatBox: true
        });
    }
    componentWillMount(){
        Axios.get(`${api_base_url}api/users`)
             .then((response)=>{
                 var userData = response.data.users;
                 
                 this.setState({userData: userData,recipentList:userData});
            });
    }
    render() {
        return (
            <div>
                {this.state.showSelectUser && <SelectUserComp onSelectUser={this.handleSelectedUser} userData={this.state.userData}/>}

                {this.state.showSelectRecipeint && <SelectRecipientComp onSelectRecipient={this.handleSelectedRecipient} userData={this.state.recipentList}/>}

                {this.state.showChatBox && <ChatBoxComp user={this.state.user} recipient={this.state.recipient} sender={this.state.recipient}/>}
            </div>
        );
    }
}

class ChatBoxComp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            conversation: [],
            user_id: this.props.user._id,
            recipient_id: this.props.recipient._id,
            inputMessage: ""
        }
    }
    componentWillMount(){
        const postObject={
            user1_id : this.state.user_id,
            user2_id : this.state.recipient_id
            }
            Axios.post(`${api_base_url}api/conversation/getConverstions`, postObject)
            .then(response=>{ 
                this.setState({
                conversation: response.data.conversations
                })
            });

        this.checkForMessages()
    }

    checkForMessages(){
        console.log("called")
        setInterval(() => {
            const postObject={
                user1_id : this.state.user_id,
                user2_id : this.state.recipient_id
             }
             Axios.post(`${api_base_url}api/conversation/getConverstions`, postObject)
             .then(response=>{ 
                 this.setState({
                    conversation: response.data.conversations
                 })
             });
        }, 2000);
    }
    
    handleInputChange = (e) => {
        this.setState({inputMessage: e.target.value});
    }
    handleSendMessage = () => {
        let inputMessage = this.state.inputMessage;
        if(inputMessage){
            const postObject={
                sender : this.state.user_id,
                recipient : this.state.recipient_id,
                message : inputMessage
            }

            Axios.post(`${api_base_url}api/conversation`, postObject)
            .then(response=>{ 
                let newMessage = response.data.message;
                if(response.status === 201){
                    this.setState(prevState =>({
                        conversation: [...prevState.conversation, newMessage],
                        inputMessage: ""
                    }))
                }
            });
        }
    }
    render(){
        return (
            <div className="chatboxContainer">
                <header>{this.props.recipient.name}</header> 
                <div className="conversation">
                        {this.state.conversation.map((item, index) => {
                            if(item.sender === this.state.user_id){
                                return <div className="text-bubble userMessage" key={item._id}>{item.message}</div>
                            } else {
                                return <div className="text-bubble recipientMessage" key={item._id}>{item.message}</div>
                            }
                        })}
                </div>
                <div className="typeMessage">
                    <input type="text" value={this.state.inputMessage} onChange={this.handleInputChange} placeholder="Type here" id="textMessage"></input>
                    <button id="sendMessage" onClick={this.handleSendMessage} className="sendMessage">send</button>
                </div>
            </div>
        )
    }
}

class SelectUserComp extends React.Component {
    constructor(props){
        super(props);
    }
    handleSelectedUser = (user) => {
        this.props.onSelectUser(user);
    }
    render(){
        return (
            <div>
                <div className="userSelectDiv">
                    <header className="subheader">select user account</header>
                    {this.props.userData.map((item, index) => {
                        return <div className="userCard" userid={item._id} onClick={() => {this.handleSelectedUser(item)}} key={index}>{item.name}</div>
                    })}
                </div>
            </div>
        )
    }
}

class SelectRecipientComp extends React.Component {
    constructor(props){
        super(props);
    }
    handleSelectedRecipient = (user) => {
        this.props.onSelectRecipient(user);
    }
    render(){
        return (
            <div>
                <div className="recipientSelectDiv">
                    <header className="subheader">Send message to:</header>
                    {this.props.userData.map((item, index) => {
                        return <div className="userCard" userid={item._id} onClick={() => {this.handleSelectedRecipient(item)}} key={index}>{item.name}</div>
                    })}
                </div>
            </div>
            )
    }
}


function App() {
  return (
    <div className="App">
        <div className="main-container">
            <header className="text-center">Chat app</header>
            <MainContainer />
        </div>
    </div>
  );
}

export default App;
