/*eslint-disable*/
import React, { Component } from 'react';
import {Button,Card,CardBody} from 'reactstrap';
import { withRouter } from 'react-router-dom';
import history from './history';
import swal from 'sweetalert2'
class LandingPage extends Component{
    // swal.fire("Welcome","","success")
    render(){
        return(
            <div align="center">
            <Card>
            <CardBody>
             <div>
                <h3>Hyperledger Fabric Tuna Fish Application</h3>
             </div>
             <div><Button onClick={()=>this.props.history.push('/RegisterAdmin')}>Register Admin</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/RegisterUser')}>Register User</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/AddTuna')}>Add</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/GetTuna')}>Get By Id</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/QueryTuna')}>QueryAll</Button></div><br/>
             <div><Button onClick={()=>this.props.history.push('/ChangeHolder')}>Change Holder</Button></div><br/>
            </CardBody>
            </Card>
            </div>
        );
    }
}
export default withRouter(LandingPage);