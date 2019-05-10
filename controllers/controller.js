var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');
var FormData      = require('form-data');

exports.AddTuna = async (req,res) => {
    try{
        console.log("submit recording of a tuna catch: ");
        var key       = await req.body.key;
        var timestamp = await req.body.timestamp;
        var location  = await req.body.location;
        var vessel    = await req.body.vessel;
        var holder    = await req.body.holder;
        var user      = await req.body.user;
        var fabric_client = new Fabric_Client();
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://192.168.99.100:7051');
        channel.addPeer(peer);
        var order = fabric_client.newOrderer('grpc://192.168.99.100:7050')
        channel.addOrderer(order);
        var member_user = null;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        console.log('Store path:'+store_path);
        var tx_id = null;
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
            }).then((state_store) => {
                fabric_client.setStateStore(state_store);
                var crypto_suite = Fabric_Client.newCryptoSuite();
                var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
                crypto_suite.setCryptoKeyStore(crypto_store);
                fabric_client.setCryptoSuite(crypto_suite);
                return fabric_client.getUserContext(user, true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded :',user,'from persistence');
                    member_user = user_from_store;
                } 
                // else if(user_from_store !=''){
                //     console.log("user empty");
                //     res.send({code:202,"error":"user empty"});
                // }
                else {
                    throw new Error('Failed to get', user,'....registerUser');
                }
                tx_id = fabric_client.newTransactionID();
                console.log("Assigning transaction_id: ", tx_id._transaction_id);
                const request = {
                    chaincodeId: 'tuna-app',
                    fcn: 'recordTuna',
                    args: [key, vessel, location, timestamp, holder],
                    chainId: 'mychannel',
                    txId: tx_id
                };
                return channel.sendTransactionProposal(request);
            }).then((results) => {
                var proposalResponses = results[0];
                var proposal = results[1];
                let isProposalGood = false;
                if (proposalResponses && proposalResponses[0].response &&
                    proposalResponses[0].response.status === 200) {
                        isProposalGood = true;
                        console.log('Transaction proposal was good');
                    } else {
                        console.error('Transaction proposal was bad');
                    }
                if (isProposalGood) {
                    console.log(util.format(
                        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                        proposalResponses[0].response.status, proposalResponses[0].response.message));
                    var request = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };
                    var transaction_id_string = tx_id.getTransactionID();
                    var promises = [];
                    var sendPromise = channel.sendTransaction(request);
                    promises.push(sendPromise);
                    let event_hub = channel.newChannelEventHub(peer);
                    // event_hub.setPeerAddr('grpc://192.168.99.100:7053');
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.disconnect();
                            resolve({event_status : 'TIMEOUT'});
                        }, 3000);
                        event_hub.connect();
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                            clearTimeout(handle);
                            event_hub.unregisterTxEvent(transaction_id_string);
                            event_hub.disconnect();
                            var return_status = {event_status : code, tx_id : transaction_id_string};
                            if (code !== 'VALID') {
                                console.error('The transaction was invalid, code = ' + code);
                                resolve(return_status);
                            } else {
                                console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                                resolve(return_status);
                            }
                        }, (err) => {
                            reject(new Error('There was a problem with the eventhub ::'+err));
                        });
                    });
                    promises.push(txPromise);
                    return Promise.all(promises);
                } else {
                    console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                }
            }).then((results) => {
                console.log('Send transaction promise and event listener promise have completed');
                if (results && results[0] && results[0].status === 'SUCCESS') {
                    console.log('Successfully sent transaction to the orderer.');
                    // console.log("-------SUCCESS-------",tx_id.getTransactionID());
                    res.send({code:200,"success":tx_id.getTransactionID()});

                } else {
                    console.error('Failed to order the transaction. Error code: ' + response.status);
                }
                if(results && results[1] && results[1].event_status === 'VALID') {
                    console.log('Successfully committed the change to the ledger by the peer');
                    res.send({code:201,"success":tx_id.getTransactionID()});
                    // console.log("-------VALID-------",tx_id.getTransactionID());
                } else {
                    console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
                    res.send({code:400,"error":"tx error"});
                }
            }).catch((err) => {
                console.error('Failed to invoke successfully :: ' + err);
            });
    }
    catch(error){
        console.log(error);
    }
}

exports.GetTuna = async(req,res) => {
    try{
        console.log("Getting Details of Tuna")
        var key = await req.body.key;
        var user = await req.body.user;
        var fabric_client = new Fabric_Client();
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://192.168.99.100:7051');
        channel.addPeer(peer);
        var member_user = null;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        console.log('Store path:'+store_path);
        var tx_id = null;
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
            }).then((state_store) => {
                fabric_client.setStateStore(state_store);
                var crypto_suite = Fabric_Client.newCryptoSuite();
                var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
                crypto_suite.setCryptoKeyStore(crypto_store);
                fabric_client.setCryptoSuite(crypto_suite);
                return fabric_client.getUserContext(user, true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded user1 from persistence');
                    member_user = user_from_store;
                } 
                // else if(user_from_store !=''){
                //     res.send({code:202,"error":"user empty"})
                // }
                else {
                    throw new Error('Failed to get user1.... run registerUser.js');
                }
                const request = {
                    chaincodeId: 'tuna-app',
                    txId: tx_id,
                    fcn: 'queryTuna',
                    args: [key]
                };
                return channel.queryByChaincode(request);
            }).then((query_responses) => {
                console.log("Query has completed, checking results");
                if (query_responses && query_responses.length == 1) {
                    if (query_responses[0] instanceof Error) {
                        console.error("error from query = ", query_responses[0]);
                        res.send({code:400,"error":"Could not locate tuna"})
                    } else {
                        console.log("Response is ", query_responses[0].toString());
                        res.send({code:200,query:query_responses[0].toString()})
                    }
                } else {
                    console.log("No payloads were returned from query");
                    res.send({code:401,"error":"Could not locate tuna"})
                }
            }).catch((err) => {
                console.error('Failed to query successfully :: ' + err);
                res.send({code:500,"error":"Could not locate tuna"})
            });
    }
    catch(error){
        console.log(error);
    }
}

exports.QueryTuna = async (req,res) => {
    try{
        console.log("getting all tuna from database: ");
        var user = await req.body.user;
        var fabric_client = new Fabric_Client();
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://192.168.99.100:7051');
        channel.addPeer(peer);
        var member_user = null;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        console.log('Store path:'+store_path);
        var tx_id = null;
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
        }).then((state_store) => {
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
                return fabric_client.getUserContext(user, true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded user1 from persistence');
                    member_user = user_from_store;
                } 
                // else if(user_from_store !=''){
                //     res.send({code:202,"error":"user empty"})
                // }
                else {
                    throw new Error('Failed to get user1.... run registerUser.js');
                }
                const request = {
                    chaincodeId: 'tuna-app',
                    txId: tx_id,
                    fcn: 'queryAllTuna',
                    args: ['']
                };
                return channel.queryByChaincode(request);
            }).then((query_responses) => {
                console.log("Query has completed, checking results");
                if (query_responses && query_responses.length == 1) {
                    if (query_responses[0] instanceof Error) {
                        console.error("error from query = ", query_responses[0]);
                        res.send({code:400,"error":"error from query"});
                    } else {
                        console.log("Response is ", query_responses[0].toString());
                        // res.json(JSON.parse(query_responses[0].toString()));
                        res.send({code:200,query:JSON.parse(query_responses[0].toString())})
                    }
                } else {
                    console.log("No payloads were returned from query");
                    res.send({code:201,"error":"No PayLoads"});
                }
            }).catch((err) => {
                console.error('Failed to query successfully :: ' + err);
            });
    }
    catch(error){
        console.log(error);
    }
}

exports.ChangeHolder = async (req,res) => {
    try{
        console.log("changing holder of tuna catch: ");
        var key = await req.body.key;
        var holder = await req.body.holder;
        var user = await req.body.user;
        var fabric_client = new Fabric_Client();
        var channel = fabric_client.newChannel('mychannel');
        var peer = fabric_client.newPeer('grpc://192.168.99.100:7051');
        channel.addPeer(peer);
        var order = fabric_client.newOrderer('grpc://192.168.99.100:7050')
        channel.addOrderer(order);
        var member_user = null;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        console.log('Store path:'+store_path);
        var tx_id = null;
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
        }).then((state_store) => {
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
                return fabric_client.getUserContext(user, true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded',user,'from persistence');
                    member_user = user_from_store;
                }
                // else if(user_from_store !=''){
                //     res.send({code:202,"error":"user empty"})
                // } 
                else {
                    throw new Error('Failed to get ',user,'....registerUser');
                }
                tx_id = fabric_client.newTransactionID();
                console.log("Assigning transaction_id: ", tx_id._transaction_id);
                var request = {
                    chaincodeId: 'tuna-app',
                    fcn: 'changeTunaHolder',
                    args: [key, holder],
                    chainId: 'mychannel',
                    txId: tx_id
                };
                return channel.sendTransactionProposal(request);
            }).then((results) => {
                var proposalResponses = results[0];
                var proposal = results[1];
                let isProposalGood = false;
                if (proposalResponses && proposalResponses[0].response &&
                    proposalResponses[0].response.status === 200) {
                        isProposalGood = true;
                        console.log('Transaction proposal was good');
                    } else {
                        console.error('Transaction proposal was bad');
                    }
                if (isProposalGood) {
                    console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                        proposalResponses[0].response.status, proposalResponses[0].response.message));
                    var request = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };
                    var transaction_id_string = tx_id.getTransactionID();
                    var promises = [];
                    var sendPromise = channel.sendTransaction(request);
                    promises.push(sendPromise);
                    let event_hub = channel.newChannelEventHub(peer);
                    // event_hub.setPeerAddr('grpc://192.168.99.100:7053');
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.disconnect();
                            resolve({event_status : 'TIMEOUT'});
                        }, 3000);
                        event_hub.connect();
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                        clearTimeout(handle);
                        event_hub.unregisterTxEvent(transaction_id_string);
                        event_hub.disconnect();
                            var return_status = {event_status : code, tx_id : transaction_id_string};
                            if (code !== 'VALID') {
                                console.error('The transaction was invalid, code = ' + code);
                                resolve(return_status);
                            } else {
                                console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                                resolve(return_status);
                            }
                        },
                        (err) => {
                            reject(new Error('There was a problem with the eventhub ::'+err));
                        });
                    });
                    promises.push(txPromise);
                    return Promise.all(promises);
                } else {
                    console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    res.send({code:400,"Error": "no tuna catch found"});
                }
            }).then((results) => {
                console.log('Send transaction promise and event listener promise have completed');
                if (results && results[0] && results[0].status === 'SUCCESS') {
                    console.log('Successfully sent transaction to the orderer.');
                    res.send({code:200,"success":tx_id.getTransactionID()})
                } else {
                    console.error('Failed to order the transaction. Error code: ' + response.status);
                    res.send({code:400,"Error": "no tuna catch found"});
                }
                if(results && results[1] && results[1].event_status === 'VALID') {
                    console.log('Successfully committed the change to the ledger by the peer');
                    res.send({code:200,"success":tx_id.getTransactionID()})
                } else {
                    console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
                    res.send({coe:301,"tx":"failed"});
                }
            }).catch((err) => {
                console.error('Failed to invoke successfully :: ' + err);
                res.send({code:400,"Error": "no tuna catch found"});
            });
    }
    catch(error){
        console.log(error);
    }
}

exports.RegisterAdmin = async (req,res) => {
    try{
        var Fabric_Client = require('fabric-client');
        var Fabric_CA_Client = require('fabric-ca-client');
        var path = require('path');
        var util = require('util');
        var os = require('os');
        var fabric_client = new Fabric_Client();
        var fabric_ca_client = null;
        var admin_user = null;
        var member_user = null;
        var admin = await req.body.admin;
        var adminpw = await req.body.pwd;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        // console.log(' Store path:'+store_path);
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
        }).then((state_store) => {
            // console.log("state store",state_store);
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            var tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            fabric_ca_client = new Fabric_CA_Client('http://192.168.99.100:7054', tlsOptions , 'ca.example.com', crypto_suite);
            return fabric_client.getUserContext(admin, true);
        }).then((user_from_store) => {
            // console.log("user from store",user_from_store);
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('----------Successfully loaded admin from persistence------------');
                res.send({code:301,"success":"Successfully loaded admin from persistence"});
                admin_user = user_from_store;
                return null;
            } else {
            return fabric_ca_client.enroll({
              enrollmentID: admin,
              enrollmentSecret: adminpw
            }).then((enrollment) => {
                // console.log("enrollment",enrollment);
                 console.log('------------------Successfully enrolled admin user  -----------',admin ,"-----------------------");
                 res.send({code:200,"success":"Admin Enrolled"});
                 return fabric_client.createUser(
                      {username: admin,
                          mspid: 'Org1MSP',
                          cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                    });
                }).then((user) => {
                    // console.log("user",user);
                  admin_user = user;
                  return fabric_client.setUserContext(admin_user);
                }).catch((err) => {
                  console.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
                  throw new Error('Failed to enroll admin');
                });
                }
                }).then(() => {
                    console.log('Assigned the admin user to the fabric client ::' + admin_user.toString());
                }).catch((err) => {
                    console.error('Failed to enroll admin: ' + err);
                    res.send({code:400,"error":"Admin Enroll Failed"});
                });
    }
    catch(error){
        console.log(error);
    }
    
}

exports.RegisterUser = async (req,res) => {
    try{
        console.log("Register User",req.body)
        var Fabric_Client = require('fabric-client');
        var Fabric_CA_Client = require('fabric-ca-client');
        var path = require('path');
        var util = require('util');
        var os = require('os');
        var fabric_client = new Fabric_Client();
        var fabric_ca_client = null;
        var admin_user = null;
        var member_user = null;
        var user = await req.body.user;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        console.log(' Store path:'+store_path);
        Fabric_Client.newDefaultKeyValueStore({ path: store_path
        }).then((state_store) => {
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            var tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            fabric_ca_client = new Fabric_CA_Client('http://192.168.99.100:7054', null , '', crypto_suite);
            return fabric_client.getUserContext('admin', true); 
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded admin from persistence');
                    admin_user = user_from_store;
                } else {
                    throw new Error('Failed to get admin.... run registerAdmin.js');
                }
                return fabric_ca_client.register({enrollmentID: user, affiliation: 'org1.department1'}, admin_user);
                }).then((secret) => {
                    console.log('Successfully registered user:'+user,'secret:'+ secret);
                   return fabric_ca_client.enroll({enrollmentID: user, enrollmentSecret: secret});
                }).then((enrollment) => {
                  console.log('Successfully enrolled member user ',user);
                  res.send({code:200,"success":"User Enrolled"});
                  return fabric_client.createUser(
                     {username: user,
                     mspid: 'Org1MSP',
                     cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                     });
                }).then((user) => {
                     member_user = user;
                     return fabric_client.setUserContext(member_user);
                }).then(()=>{
                    console.log('User1 was successfully registered and enrolled and is ready to intreact with the fabric network');

                }).catch((err) => {
                    console.error('Failed to register: ' + err);
                    res.send({code:400,"error":"Failed To Register User"});
                    if(err.toString().indexOf('Authorization') > -1) {
                        console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
                        'Try again after deleting the contents of the store directory '+store_path);
                    }
                });
    }
    catch(error){
        console.log(error);
    }
}

exports.UserLogin = async (req,res) => {
    try{
        var user = await req.body.user;
        var Fabric_Client = require('fabric-client');
        var Fabric_CA_Client = require('fabric-ca-client');
        var path = require('path');
        var util = require('util');
        var os = require('os');
        var fabric_client = new Fabric_Client();
        var fabric_ca_client = null;
        var admin_user = null;
        var member_user = null;
        var store_path = path.join(os.homedir(), '.hfc-key-store');
        console.log('Store path:'+store_path);
        var tx_id = null;
        if(user!=''){
            Fabric_Client.newDefaultKeyValueStore({ path: store_path
            }).then((state_store) => {
                fabric_client.setStateStore(state_store);
                var crypto_suite = Fabric_Client.newCryptoSuite();
                var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
                crypto_suite.setCryptoKeyStore(crypto_store);
                fabric_client.setCryptoSuite(crypto_suite);
                return fabric_client.getUserContext(user, true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded :',user,'from persistence');
                    member_user = user_from_store;
                    res.send({code:200,"user":user_from_store._name});
                }
                else {
                    throw new Error('Failed to get', user,'No User');
                    res.send({code:400});
                }
            })
        }
        else{
            res.send({code:202});
        }
    }
    catch(error){
        console.log(error);
    }
}
