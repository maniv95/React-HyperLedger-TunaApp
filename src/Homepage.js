/*eslint-disable*/
import React, { Component } from 'react';
import {Button,Card,CardBody} from 'reactstrap';
import { withRouter } from 'react-router-dom';
import history from './history';
import swal from 'sweetalert2'
class HomePage extends Component{
    constructor(props){
        super(props);
        this.onLogout= this.onLogout.bind(this);
    }
    onLogout(){
        try{
            localStorage.removeItem('user');
            swal.fire("Logged Out","","success");
            this.props.history.push("/");
        }
        catch(error){
            console.log(error);
        }   
    }
    render(){
        return(
            <div align="center">
            <Card>
            <CardBody>
             <div>
                <h3>Dashboard</h3>
             </div>
             <div><Button onClick={()=>this.props.history.push('/AddTuna')}>Add New Tuna Catch</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/GetTuna')}>Get Tuna By Id</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/QueryTuna')}>QueryAll Tuna</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/ChangeHolder')}>Change Tuna Holder</Button></div><br/>
             <div><Button onClick={this.onLogout}>Logout</Button></div>
            </CardBody>
            </Card>
            </div>
        );
    }
}
export default withRouter(HomePage);