var SimpleMDE = require('simplemde');

const electron = require('electron');
var shell = electron.shell;
const {dialog} = require('electron').remote
console.log(dialog)
var simplemde = new SimpleMDE({ 
	autofocus: true,
    autosave: {
        enabled: true,
        uniqueId: "1",
        delay: 1000,
    },
    element: $("#editor")[0],
    
    initialValue: '---\ntitle:\ncategory:\ntags: [,]\n\n---\nYour summary here.\n<!-- more -->',
	toolbarTips: true,
    toolbar: [
    	{
			name: "custom",
	        action: function customFunction(editor){
	            // Add your own code
	        },
	        className: "fa fa-cogs js-open-bottom-slidebar",
	        title: "Custom Button",
    	},
		'|',
		{
			name: "custom",
			action: function setFormat(){
				var format = '---\ntitle:\ncategory:\ntags: [,]\n\n---\nYour summary here.\n<!-- more -->';
				simplemde.value(format);
				current_url = null;
			},
			className: "fa fa-file-o",
			title: "Reset Format"
		},
		{
			name: "undo",
			action: function undo(editor) {
				var cm = editor.codemirror;
				cm.undo();
				cm.focus();
			},
			className: "fa fa-reply",
			title: "Undo Ctrl-Z",
		},
		{
			name: "redo",
			action: function redo(editor) {
				var cm = editor.codemirror;
				cm.redo();
				cm.focus();
			},
			className: "fa fa-share",
			title: "Redo Ctrl-Y",
		},
    	'|',
    	'bold',
    	'italic',
    	'strikethrough',
    	'heading',
    	'|',
    	'code',
    	'quote',
    	'|',
    	'unordered-list',
    	'ordered-list',
    	'|',
    	'link',
    	'image',
    	'table',
    	'|',
    	'preview',
    	'side-by-side',
    	'|',
    	{
    		name: "SaveToLocal",
            action: function (editor){
				//写入本地文件
				var fs = require('fs');
				var _path = dialog.showSaveDialog({filters: [{ name: '文本文档', extensions: ['txt', 'pdf'] },{ name: 'All Files', extensions: ['*'] }]});//dialog.showOpenDialog({ properties: [ 'openDirectory']});
				if (_path == undefined)
					return false;
				console.log(_path);
				fs.readFile(_path, 'utf8', function (err, data) {
					if (err) return console.log(err);
				});

				fs.writeFile(_path, simplemde.value(), function (err) {
				if (!err)
				  console.log("写入成功！");
				});
			},
            className: "fa fa-folder",
            title: "Save on local Ctrl-S",
    	},	
    	{
    		name: "ReadFromLocal",
            action: function ReadFromLocal(editor){
				//本地文件读入
				var fs = require('fs');
				var _path = dialog.showOpenDialog({ properties: [ 'openFile' ]});
				if (_path == undefined)
					return false;
				//shell.showItemInFolder(path1);
				fs.readFile(_path[0], 'utf8', function (err, data) {
					if (err) return console.log(err);
					simplemde.value(data);
				});
            },
            className: "fa fa-folder-open-o",
            title: "Read from local",
    	},
		'|',
    	{
    		name: "SaveAsDraft",
            action: function SaveAsDraft(editor){
 				console.log("enterSaveDraft");
				//var url_publish = "http://10.201.14.171:5000/api/v1.0/blogs/";
				var url_publish = "https://blext.herokuapp.com/api/v1.0/blogs/";
				var request = {
					body: simplemde.value(),
					draft: true
				};
				var request_json = JSON.stringify(request); 
				$.ajax({
					type:'POST',
					data: request_json,
					url:url_publish,
					dataType:'json',
					contentType: "application/json; charset=utf-8",
					headers:{
							'Authorization': 'Basic ' + btoa(token+':')
					},
					success:function(result,status){
						console.log(request);
						console.log("result:"+result);
						console.log("status:"+status);
					},
					error:function(result,status){
						console.log("result:"+JSON.stringify(result));
						console.log("status:"+status);
						if (result.status == 401)
							alert("Have not Login");
					}
					}).done(function (result,status){
						alert("Sucessfully SaveAsDraft");
						console.log("result:"+JSON.stringify(result));
						console.log("status:"+status);
						getUserInfoList();
				});
            },
            className: "fa fa-save",
            title: "Save as draft",
    	},
    	{
    		name: "Publish",
            action: function Publish(editor){
				console.log("enterPublishing");
				//var url_publish = "http://10.201.14.174:5000/api/v1.0/blogs/";
				var url_publish;
				if (current_url != null)
				{
					if (window.confirm("Publish as a modified Blog?This will cover the former blog."))
						url_publish = current_url;
				}	
				else
					url_publish = "https://blext.herokuapp.com/api/v1.0/blogs/";
				
				var request = {
					body: simplemde.value(),
					draft: false
				}
				request_json = JSON.stringify(request); 
				$.ajax({
					type:current_url == null?'POST':'PUT',
					data: request_json,
					url:url_publish,
					dataType:'json',
					contentType: "application/json; charset=utf-8",
					headers:{
							'Authorization': 'Basic ' + btoa(token+':')
					},
					success:function(result,status){
						console.log("result:"+result);
						console.log("status:"+status);
					},
					error:function(result,status){
						console.log("result:"+JSON.stringify(result));
						console.log("status:"+status);
						if (result.status == 401)
							alert("Have not Login");
					}
					}).done(function (result,status){
						alert("Sucessfully Publishing");
						console.log("result:"+JSON.stringify(result));
						console.log("status:"+status);
						getUserInfoList();
				});
            },
            className: "fa fa-paper-plane",
            title: "Publish Ctrl-P",
    	},	
    ],
});
simplemde.toggleFullScreen();
