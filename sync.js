var shell = require('shelljs');
var Promise = require('promise');
var DRC = require('docker-registry-client');
//shell.exec('docker search xxxx');

//gcr.io/spinnaker-marketplace/clouddriver



function pullImages(repoName,tagList){
	for(var idx=0;idx<tagList.length;idx++){
		shell.exec('docker pull '+repoName+':'+tagList[idx]);
	}
}



function listRepoTags(repoName){
   var client = DRC.createClientV2({name: repoName,username:'fzj',password:'fzj',insecure:true});
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
	return listRepoTags(repoName).then(function (tagList){
		console.log('tagList:'+tagList);
		pullImages(repoName,tagList);

	}).then(function(){
		console.log('done');

	}).catch(function (error){
		console.log('error:'+error);
	});
}


var REPO = 'gcr.io/spinnaker-marketplace/backend';
// var REPO = 'registry.sxlbzm.com/nodeapp'
//47.52.238.92 
//var client = drc.createClientV1({name: REPO});

handleOneRepo(REPO);






