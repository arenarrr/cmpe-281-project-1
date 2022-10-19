const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
const nodemon = require('nodemon');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}))
const mysqlConnection = mysql.createConnection({
    host : "database-2.chc0g0dzre83.us-west-1.rds.amazonaws.com",
    port : "3306",
    user : "admin",
    password :"admin123",
    database : "databaseCloud"
});
mysqlConnection.connect(err=>{
    if(err){
        console.log(err.message);
        return;
    }
    console.log("Database Connection is successful")
});

app.get("/", (req, res)=>{
    res.send("hello world")
})

app.get('/userdata',(req,res)=>
{
    mysqlConnection.query('SELECT * FROM userdata',(err, rows, fields)=>{
    if(!err)
    res.send(rows);
    else
    console.log(err);
    })

   });

app.post('/register',(req,res)=>
{
    console.log("abc");
    mysqlConnection.query('INSERT INTO userdata(firstname,lastname,email,password) VALUES (?,?,?,?)',[req.firstname,req.lastname,req.email,req.password],
   (err,response)=>
   {
    if(!err)
    {
        console.log(response);
        res.send('record has been inserted');
    }
    else
    {
        throw err;
    }
   });
})
app.listen(8000,()=>console.log("Express server is running at this port"));

/*
//Get all employees
app.get('/userdata',(req,res)=>){

    mysqlConnection.query('SELECT * FROM userdata',(err, rows, fields)=>{ 
        if(!err)
        res.send(rows)
        else 
        console.log(err);
    })
});

//Get an employee

app.get('/userdata/:id',(req,res)=>){

    mysqlConnection.query('SELECT * FROM userdata WHERE userid = ?',[req.params.id],(err, rows, fields)=>{ 
        if(!err)
        res.send(rows)
        else 
        console.log(err);
    })
});

//Delete an employee
app.delete('/userdata/:id',(req,res)=>){

    mysqlConnection.query('DELETE FROM userdata WHERE userid = ?',[req.params.id],(err, rows, fields)=>{ 
        if(!err)
        res.send('Deleted the record successfully')
        else 
        console.log(err);
    })
});

//Insert an employee
app.post('/register',(req,res)=>){
    let emp = req.body;
    var seql = "SET @userid = ?;SET @EMPCode = ?;SET @Salary = ?; \
    CALL userdataAddOrEdit(@userid,@firstname,@lastname,@email,@password);"
    mysqlConnection.query(],(err, rows, fields)=>{ 
        if (!err)
            rows.forEach(element => {
                if(element.constructor == Array)
                res.send('Inserted employee id : '+element[0].EmpID);
            });
        else
            console.log(err);
    })
});

//Update an employees
app.put('/employees', (req, res) => {
    let emp = req.body;
    var sql = "SET @EmpID = ?;SET @Name = ?;SET @EmpCode = ?;SET @Salary = ?; \
    CALL EmployeeAddOrEdit(@EmpID,@Name,@EmpCode,@Salary);";
    mysqlConnection.query(sql, [emp.EmpID, emp.Name, emp.EmpCode, emp.Salary], (err, rows, fields) => {
        if (!err)
            res.send('Updated successfully');
        else
            console.log(err);
    })
});  */ 

