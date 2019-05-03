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

        }
        this.onRegisterUser = this.onRegisterUser.bind(this);
    }
    onRegisterUser (){
        try{
            fetch('http://localhost:8080/api/RegisterUser')
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
            <header className = "App-Header">
            <h2>Register User</h2>
            </header>
            <Button onClick={this.onRegisterUser}>Register User</Button>
            <div align="right"><Button onClick={()=>this.props.history.push("/")}>Home</Button></div>
            </div>
        );
    }
}
export default withRouter(RegisterUser);
