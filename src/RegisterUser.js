/*eslint-disable*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route , Switch } from "react-router-dom";
import { withRouter } from 'react-router';
import {Button} from 'reactstrap';
import history from './history';
import swal from 'sweetalert2';
class RegisterUser extends Component{
    constructor(props){
        super(props);
        this.state={
            user:''
        }
        this.onUser = this.onUser.bind(this);
        this.onRegisterUser = this.onRegisterUser.bind(this);
    }
    onUser(a){
        this.setState({ user: a.target.value});
    }
    onRegisterUser (){
        try{
            var formBody = []
            formBody.push("user="+encodeURIComponent(this.state.user));
            fetch('http://localhost:8080/api/RegisterUser',{
                method:'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept-Charset': 'utf-8'
                },
                body: formBody
            })
            .then((res)=>res.json())
            .then(data => {
                console.log(data)
                if(data.code==200){
                    swal.fire("Registered User","","success");
                    this.props.history.push('/');
                }
                else if(data.code==301){
                    swal.fire("Already Registered","Loaded From Persistance","success");
                    this.props.history.push('/');
                }
                else if(data.code ==400){
                    swal.fire("Register User Failed","","error");
                }
                else{
                    swal.fire("Network Error","","error");
                }
            })
        }
        catch(error){
            console.log(error);
        }
    }
    render(){
        return(
            <div className="App" align="center">
            <br/>
            <header className = "App-Header">
            <div align="center"><Button onClick={()=>this.props.history.push("/")}>Home</Button></div>
            <h2>Register User</h2>
            </header>
            <br/>
            <label>User Name</label><br/>
            <input type="text" value={this.state.user} onChange={this.onUser} />
            <br/><br/>
            <Button onClick={this.onRegisterUser}>Register User</Button>
            </div>
        );
    }
}
export default withRouter(RegisterUser);
