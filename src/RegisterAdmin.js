/*eslint-disable*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route , Switch } from "react-router-dom";
import { withRouter } from 'react-router';
import {Button} from 'reactstrap';
import swal from 'sweetalert2';
import history from './history';
class RegisterAdmin extends Component{
    constructor(props){
        super(props);
        this.state={
            admin:"",
            pwd:''
        }
        // this.onAdmin = this.onAdmin.bind(this);
        // this.onPwd = this.onPwd.bind(this);
        this.onRegisterAdmin = this.onRegisterAdmin.bind(this);
    }
    // onAdmin(a){
    //     this.setState({admin :a.target.value});
    // }
    // onPwd(b){
    //     this.setState({pwd :b.target.value});
    // }
    onRegisterAdmin (){
        try{
            fetch("http://localhost:8080/api/RegisterAdmin")
            .then((res)=>res.json())
            .then(data => {
                console.log(data)
                if(data.code==200){
                    swal.fire("Registered Admin","","success");
                    this.props.history.push('/');
                }
                else if(data.code==301){
                    swal.fire("Already Registered","Loaded From Persistance","success");
                    this.props.history.push('/');
                }
                else if(data.code ==400){
                    swal.fire("Register Admin Failed","","error");
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
            <h2>Register Admin</h2>
            </header>
            <br/>
            <Button onClick={this.onRegisterAdmin}>Register</Button>
            <div align="right"><Button onClick={()=>this.props.history.push("/")}>Home</Button></div>
            </div>
        );
    }
}
export default withRouter(RegisterAdmin);
