/*eslint-disable*/
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {Button} from 'reactstrap';
import history from './history';
import swal from 'sweetalert2';
class ChangeHolder extends Component {
    constructor(props){
        super(props);
        this.state = {
            key:'',
            Holder:'',
            txId:'',
            user:''
        }
        this.onKey = this.onKey.bind(this);
        this.onHolder = this.onHolder.bind(this);
        this.onChangeHolder = this.onChangeHolder.bind(this);
        this.onCheck = this.onCheck.bind(this);
    }
    onKey(a){
        this.setState({key: a.target.value});
    }
    onHolder(b){
        this.setState({Holder:b.target.value});
    }
    componentDidMount(){
        this.onCheck();
    }
    onCheck(){
        if(sessionStorage.getItem('loggedin')){
            console.log("session logged in");
        }
        else{
            swal.fire("Please Login","","error");
            this.props.history.push('/UserLogin');
        }
    }
    onChangeHolder(){
        try{
            let formBody = []
            formBody.push("key="+encodeURIComponent(this.state.key));
            formBody.push("holder="+encodeURIComponent(this.state.Holder));
            formBody.push("user="+encodeURIComponent(localStorage.getItem('user')));
            formBody = formBody.join("&");
            fetch("http://localhost:8080/api/ChangeHolder",{
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody
            })
            .then((res) => res.json())
            .then(data =>{
                console.log(data);
                if(data.code ==200){
                    swal.fire("Updated Holder","","success");
                    this.setState({
                        txId:data.success
                    })   
                }
                else if(data.code==202){
                    swal.fire("Please Login","","error");
                    this.props.history.push('/UserLogin');
                }
                else if(data.code ==400 || data.code ==301){
                    swal.fire("No Details Found","","error");
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
            <header className="App-Header">
            <div align="center"><Button onClick={()=>this.props.history.push("/HomePage")}>Home</Button></div>
            <h3>Change Holder</h3>
            </header>
            <label>Key</label><br/>
            <input type ="number" value={this.state.key} onChange={this.onKey}/>
            <br/>
            <label>Holder</label><br/>
            <input type ="text" value={this.state.holder} onChange={this.onHolder}/>
            <br/>
            <br/>
            <Button onClick={this.onChangeHolder}>ChangeHolder</Button>
            <br/>
            <p>Transaction Id: {this.state.txId} </p>
            <br/>
            </div>
        );
    }
}
export default withRouter(ChangeHolder);