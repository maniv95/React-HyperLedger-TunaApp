/*eslint-disable*/
import React,{Component} from 'react';
import {Button,Card,CardBody} from 'reactstrap';
import { withRouter } from 'react-router';
import history from './history';
import swal from 'sweetalert2';

class UserLogin extends Component{
    constructor(props){
        super(props);
        this.state ={
            users:''
        }
        this.onUser = this.onUser.bind(this);
        this.onLogin = this.onLogin.bind(this);
    }
    onUser(a){
        this.setState({users: a.target.value});
    }
    onLogin(){
        try{
            var formBody = []
            formBody.push("user="+encodeURIComponent(this.state.users));
            formBody = formBody.join("&");
            fetch('http://localhost:8080/api/UserLogin',{
                method:'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept-Charset': 'utf-8'
                },
                body: formBody
            })
            .then((res) => res.json())
            .then(data =>{
                // console.log(data);
                if(data.code ==200){
                    sessionStorage.setItem('user',data.user);
                    sessionStorage.setItem('loggedin',true);
                    swal.fire("Logged in As: " + data.user + "","","success");
                    this.props.history.push('/HomePage');
                }
                else if(data.code==202){
                    swal.fire("Please Enter User","","warning");
                }
                else if(data.code==400){
                    swal.fire("No User Found","Please Register User","error");
                    this.props.history.push('/RegisterUser');
                }
            })
        }
        catch(error){
            console.log(error);
        }
            
    }
    render(){
        return(
            <div align="center">
            <br/>
            <header className = "App-Header">
            <div align="center"><Button onClick={()=>this.props.history.push("/")}>Home</Button></div>
            <h3>Login As User </h3>
            </header>
            <br/>
             <label>User</label><br/>
             <input type="text" value={this.state.users} onChange={this.onUser} />
             <br/>
             <br/>
             <Button onClick={this.onLogin}>Login</Button>
             <br/><br/>
             <p>New User <Button onClick={()=>this.props.history.push("/RegisterUser")}>Sign Up</Button> </p>
            </div>
        );
    }
}
export default withRouter(UserLogin);
