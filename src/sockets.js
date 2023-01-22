export default (io)=>{

    io.on("connection", (socket)=>{

        console.log("New User Connected: " + socket.id)

        socket.on("disconnect", ()=>{
            console.log("User Disconnected: " + socket.id)
        })

        socket.on('UpdateOnDatabase', function(msg){
            socket.broadcast.emit('RefreshPage');
        });
    })

    
}