 var ws = require("nodejs-websocket")


 function Wss(port) {
     this.port = port
     this.init()
 }

 Wss.prototype.init = function() {
     var that = this
     this.ws = ws.createServer(function(conn) {
         conn.on("text", function(str) {
             console.log("收到的信息为:" + str)
             var data = JSON.parse(str)
             console.log(conn.key)
             that.cb(data,conn.key)
         })
         conn.on("close", function(code, reason) {
             console.log("关闭连接==>" +conn.key)
             var bres = { 'method': 'MSG', 'text':  conn.key + ' 离开聊天室' }
             that.broadcast(JSON.stringify(bres))
         });
         conn.on("error", function(code, reason) {
             console.log("异常关闭==>"+conn.key)
         });
     }).listen(this.port)
     console.log("WebSocket建立完毕")
 };

 Wss.prototype.cb = function(data,key) {
     if (data.method && data.method == 'GET') {
         var res = { 'method': 'NAME', 'name':key}
         var bres = { 'method': 'MSG', 'text': '欢迎 ' + key + ' 进入聊天室' ,'name':key }
         this.sendMsg(key, JSON.stringify(res))
         this.broadcast(JSON.stringify(bres))
     }

     if(data.method && data.method == 'PUSH' && data.text){
        var bres = { 'method': 'MSG', 'text': data.text ,'name':key}
        this.broadcast(JSON.stringify(bres))
     }
 };

 Wss.prototype.sendMsg = function(key, msg) {
     if (this.findWorker(key)) {
         this.findWorker(key).forEach(item => {
             item.sendText(msg)
         })
     }
 }


 Wss.prototype.findWorker = function(key) {
     if (!key) return false
     return this.ws.connections.filter(item => {
         return item.key == key
     })
 };

 Wss.prototype.broadcast = function(msg) {
     if (!msg) return false
     this.ws.connections.forEach(item => {
         item.sendText(msg)
     })
 };


 module.exports = Wss
