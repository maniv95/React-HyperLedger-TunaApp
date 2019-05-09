/*eslint-disable*/
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {Button,Table} from 'reactstrap';
import history from './history';
import swal from 'sweetalert2';
class GetTuna extends Component{
    constructor(props){
        super(props);
        this.state = {
            key:'',
            location:'',
            holder:'',
            timestamp:'',
            vessel:'',
        }
        this.onKey = this.onKey.bind(this);
        this.onGet = this.onGet.bind(this);
    }
    onKey(a){
        this.setState({key:a.target.value});
    }
    onGet() {
        try{
            let formBody =[]
            formBody.push("key="+encodeURIComponent(this.state.key));
            formBody.push("user="+encodeURIComponent(localStorage.getItem('user')));
            formBody = formBody.join("&");
            fetch("http://localhost:8080/api/GetTuna",{
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
                if(data.code == 200){
                    var query = JSON.parse(data.query);
                    swal.fire("Details Retrieved","","success");
                    this.setState({
                        holder: query.holder,
                        location : query.location,
                        timestamp : query.timestamp,
                        vessel :query.vessel
                    })
                }
                else if(data.code==202){
                    swal.fire("Please Login","","error");
                    this.props.history.push('/UserLogin');
                }
                else if(data.code == 400 || data.code == 401){
                    swal.fire("No Details Found","","error");
                }
                else if (data.code == 500){
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
            <header className="App-header">
            <h3>Get Details By ID </h3>
            </header>
            <label>Key</label><br/>
            <input type="number" value={this.state.key} onChange={this.onKey} />
            <br/><br/>
            <Button onClick={this.onGet}>Get</Button>
            <p>Details</p>
            <Table align="center" border="1">
            <tbody>
                <tr>
                    <td>Holder</td>
                    <td>{this.state.holder}</td>
                </tr>
                <tr>
                    <td>Location</td>
                    <td>{this.state.location}</td>
                </tr>
                <tr>
                    <td>Timestamp</td>
                    <td>{this.state.timestamp}</td>
                </tr>
                <tr>
                    <td>Vessel</td>
                    <td>{this.state.vessel}</td>
                </tr>
            </tbody>
            </Table>
            <div align="right"><Button onClick={()=>this.props.history.push("/HomePage")}>Home</Button></div>
            </div>
        );
    }
}
export default withRouter(GetTuna);
