var shell = require('shelljs');
var inspect = require('util').inspect;
var Promise = require('promise');
var DRC = require('docker-registry-client');
//shell.exec('docker search xxxx');

//gcr.io/spinnaker-marketplace/clouddriver

var registryName = process.env.DOCKER_SERVER;
var userName = process.env.DOCKER_USER ;
var password = process.env.DOCKER_PASS ;

function transRepoName(repoName){
	return repoName.replace('gcr.io',registryName);
}

function syncImages(repoName,tagList){
	for(var idx=0;idx<tagList.length;idx++){
		shell.exec('docker pull '+repoName+':'+tagList[idx]);
		shell.exec('docker tag '+repoName+':'+tagList[idx]+' '+transRepoName(repoName)+':'+tagList[idx]);
		shell.exec('docker push '+repoName+':'+tagList[idx]+' '+transRepoName(repoName)+':'+tagList[idx]);
	}

	for(var idx=0;idx<tagList.length;idx++){
		shell.exec('docker rmi '+repoName+':'+tagList[idx]);
	}

	for(var idx=0;idx<tagList.length;idx++){
		shell.exec('docker rmi '+repoName+':'+tagList[idx]+' '+transRepoName(repoName)+':'+tagList[idx]);
	}
}

function listExistRepoTags(repoName){
	console.log('repo:'+transRepoName(repoName)+'userName:'+userName);
var client = DRC.createClientV2({name: transRepoName(repoName),username:userName,password:password,insecure:true});
   return new Promise(function (resolve, reject) {

	client.listTags(function (err, response) {
    	client.close();
    	if(err){
    		let errorMessage = inspect(err);
    		if(errorMessage.indexOf('NAME_UNKNOWN')>=0){
    			resolve([]);
    		}else{
    			reject(err);	
    		}
    		
    	}else{
    		resolve(response.tags);
    	}
	});

   	});
}

function listRepoTags(repoName){
   var client = DRC.createClientV2({name: repoName,insecure:true});
   return new Promise(function (resolve, reject) {

	client.listTags(function (err, response) {
    	client.close();
    	if(err){
    		
    		reject(err);
    	}else{
    		resolve(response.tags);
    	}
	});

   	});
}



function handleOneRepo(repoName){
	let existTagList = [];

	return listExistRepoTags(repoName).then(function(tagList){
		existTagList = tagList;
		return listRepoTags(repoName);
	}).then(function (tagList){
		let targetTagList = [];
		for(let idx=0;idx<tagList.length;idx++){
			if(existTagList.indexOf(tagList[idx])<0 || tagList[idx] === 'latest'){
				targetTagList.push(tagList[idx]);
			}
		}

		syncImages(repoName,targetTagList);

	}).then(function(){
		console.log('done');

	}).catch(function (error){
		console.log('error:'+error);
	});
}


var REPO = 'gcr.io/spinnaker-marketplace/clouddriver';
//REPO = 'jwilder/nginx-proxy';
// var REPO = 'registry.sxlbzm.com/nodeapp'
//47.52.238.92 
//var client = drc.createClientV1({name: REPO});

handleOneRepo(REPO);






