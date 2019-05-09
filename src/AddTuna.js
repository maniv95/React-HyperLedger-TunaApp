/*eslint-disable*/
import React,{Component} from 'react';
import {Button,Card,CardBody} from 'reactstrap';
import { withRouter } from 'react-router';
import history from './history';
import swal from 'sweetalert2';
class AddTuna extends Component{
	constructor(props){
		super(props);
		this.state = {
			key :'',
			timestamp:'',
			location:'',
			vessel:'',
			holder:'',
			txId:''
		}
		this.onKey = this.onKey.bind(this);
		this.onTimestamp = this.onTimestamp.bind(this);
		this.onLocation = this.onLocation.bind(this);
		this.onVessel = this.onVessel.bind(this);
		this.onHolder = this.onHolder.bind(this);
		this.onAdd = this.onAdd.bind(this);
	}
	onKey(a){
		this.setState({key:a.target.value})
	}
	onTimestamp(b){
		this.setState({timestamp:b.target.value})
	}
	onLocation(c){
		this.setState({location:c.target.value})
	}
	onVessel(d){
		this.setState({vessel:d.target.value})
	}
	onHolder(e){
		this.setState({holder:e.target.value})
	}
	onAdd(){
		try{
			let formBody = []
			formBody.push("key="+encodeURIComponent(this.state.key));
			formBody.push("timestamp="+encodeURIComponent(this.state.timestamp));
			formBody.push("location="+encodeURIComponent(this.state.location));
			formBody.push("vessel="+encodeURIComponent(this.state.vessel));
			formBody.push("holder="+encodeURIComponent(this.state.holder));
			formBody.push("user="+encodeURIComponent(localStorage.getItem('user')));
			formBody = formBody.join("&");
			fetch('http://localhost:8080/api/AddTuna',{
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
				console.log(data);
				if(data.code ==200 || data.code == 201){
					swal.fire("Added","","success");
					this.setState({
						txId: data.success
					})
				}
				else if(data.code==202){
					swal.fire("Please Login","","error");
					this.props.history.push('/UserLogin');
				}
				else if(data.code==400){
					swal.fire("Error In Processing","","error");
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
			<header className="App-header">
            <h3>Add Details</h3>
            </header>
			<label>Key</label><br/>
			<input type ="number" value={this.state.key} onChange={this.onKey}/>
			<br/>
			<label>Timestamp</label><br/>
			<input type ="number" value={this.state.timestamp} onChange={this.onTimestamp}/>
			<br/>
			<label>Location</label><br/>
			<input type ="text" value={this.state.location} onChange={this.onLocation}/>
			<br/>
			<label>Vessel</label><br/>
			<input type ="text" value={this.state.vessel} onChange={this.onVessel}/>
			<br/>
			<label>Holder</label><br/>
			<input type ="text" value={this.state.holder} onChange={this.onHolder}/>
			<br/><br/>
			<Button onClick={this.onAdd}>Add</Button>
			<br/>
			<p>Transaction Id: {this.state.txId} </p>
			<br/>
			<div align="right"><Button onClick={()=>this.props.history.push("/HomePage")}>Home</Button></div>
			<br/>
			</div>
		);
	}
}
export default withRouter(AddTuna);