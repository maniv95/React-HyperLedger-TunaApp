package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type CarDetails struct{
	Manufacturer string `json:"manufacturer"` 
	Model        string `json:"model"`
	EngineType   string `json:"enginetype"`
	Owner        string `json:"owner"`
}

func(s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response{
	function,args := APIstub.GetFunctionAndParameters();
	if function == "queryCar"{
		return s.queryCar(APIstub,args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordCar"{
		return s.recordCar(APIstub,args)
	} else if function == "queryAll" {
		return s.queryAll(APIstub)
	} else if function == "changeCarOwner"{
		return s.changeCarOwner(APIstub,args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect Number of Arguments , Expecting 1")
	}
	carAsbytes, _ := APIstub.GetState(args[0])
	if carAsbytes == nil {
		return shim.Error("Could not locate car")
	}
	return shim.Success(carAsbytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	car := []CarDetails{
		CarDetails{Manufacturer: "Jaguar",      Model: "A1", EngineType:"Diesel", Owner:"Nick"},
		CarDetails{Manufacturer: "Renault",     Model: "B1", EngineType:"Diesel", Owner:"Brandon"},
		CarDetails{Manufacturer: "Audi",        Model: "C1", EngineType:"Diesel", Owner:"Anderson"},
		CarDetails{Manufacturer: "Maruti",      Model: "D1", EngineType:"Diesel", Owner:"Sherley"},
		CarDetails{Manufacturer: "Merceds-Benz",Model: "E1", EngineType:"Diesel", Owner:"Pouline"},
		CarDetails{Manufacturer: "Rolls Royce", Model: "F1", EngineType:"Petrol", Owner:"Mario"},
		CarDetails{Manufacturer: "BMW",         Model: "G1", EngineType:"Diesel", Owner:"Steve"},
		CarDetails{Manufacturer: "Porsche",     Model: "H1", EngineType:"Diesel", Owner:"George"},
		CarDetails{Manufacturer: "Lambhorgini", Model: "I1", EngineType:"Diesel", Owner:"Athenes"},
		CarDetails{Manufacturer: "Astonmartin", Model: "J1", EngineType:"Diesel", Owner:"James"},
	}
	i := 0
	for i < len(car) {
		fmt.Println("i is ", i)
		carAsBytes, _ := json.Marshal(car[i])
		APIstub.PutState(strconv.Itoa(i+1), carAsBytes)
		fmt.Println("Added", car[i])
		i = i + 1
	}
	return shim.Success(nil)
}

func (s *SmartContract) recordCar(APIstub shim.ChaincodeStubInterface,args []string) sc.Response {
	if len(args) != 5{
		return shim.Error("Incorrect Number of Arguments , Expecting 5")
	}
	var car = CarDetails{Manufacturer: args[1], Model: args[2], EngineType: args[3], Owner: args[4] }
	carAsbytes, _ := json.Marshal(car)
	err := APIstub.PutState(args[0],carAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record car details: %s", args[0]))
	}
	return shim.Success(nil)
}

func (s *SmartContract) queryAll(APIstub shim.ChaincodeStubInterface) sc.Response{
	startKey := "0"
	endKey := "999"
	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")
		buffer.WriteString(", \"Record\":")
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- queryAllCar:\n%s\n", buffer.String())
	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) changeCarOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	if carAsBytes == nil {
		return shim.Error("Could not locate car")
	}
	car := CarDetails{}

	json.Unmarshal(carAsBytes, &car)
	car.Owner = args[1]
	carAsBytes, _ = json.Marshal(car)
	err := APIstub.PutState(args[0], carAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change car owner: %s", args[0]))
	}

	return shim.Success(nil)
}

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
