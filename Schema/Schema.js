import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInt } from 'graphql';
import jwt from "jsonwebtoken"
import sql from 'mssql';
import dotenv from "dotenv"
dotenv.config();
const SECRET_KEY = 
"asdfhasdfjkah";
// Student Login 
const StudentLoginType = new GraphQLObjectType({
    name: 'StudentLogin',
    fields: () => ({
        StudentID: { type: GraphQLString },
        FirstName: { type: GraphQLString },
        LastName: { type: GraphQLString }
    })
});

const FaultyloginType = new GraphQLObjectType({
    name:"FacultyLogin",
    fields : ()=>({
       Username:{ type: GraphQLString },
       token: { type: GraphQLString },
      School_Id :{type:GraphQLString}
    })
})


// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
    
       
        
        studentLogin: {
            type: StudentLoginType,
            args: {
                Username: { type: new GraphQLNonNull(GraphQLString) },
                Password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                return sql.query`SELECT StudentID, FirstName, LastName FROM Students WHERE StudentID = ${args.Username} AND Password = ${args.Password}`
                    .then(result => result.recordset[0]);
            }


        },
        Facultylogin :{
            type:FaultyloginType,
            args :
            {
                Username: {type: new GraphQLNonNull(GraphQLString)},
                Password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent,args){
                return sql.query`SELECT Username,Password  FROM Faculty WHERE Username = ${args.Username} AND Password =${args.Password} `
                .then(async result =>{
                    const faculty= result.recordset[0];
                    if(!faculty){
                        throw new Error("invaild credentials")
                    }
                    const token = jwt.sign({ username: faculty.Username }, SECRET_KEY, { expiresIn: '1h' });
                    console.log("Generated Token:", token);
                    return {
                        token,
                        username: faculty.Username,
                    };
                    
                })
            }
        }
    }
});

// Mutation     
// const Mutation = new GraphQLObjectType({
//     name: 'Mutation',
//     fields: {
//         addFaculty: {
//             type: FacultyType,
//             args: {
//                 Username: { type: new GraphQLNonNull(GraphQLString) },
//                 Password: { type: new GraphQLNonNull(GraphQLString) },
//                 Location: { type: new GraphQLNonNull(GraphQLString) },
//                 SchoolName: { type: new GraphQLNonNull(GraphQLString) }
//             },
//             resolve(parent, args) {
//                 return sql.query`INSERT INTO Faculty (Username, Password, Location, SchoolName) VALUES (${args.Username}, ${args.Password}, ${args.Location}, ${args.SchoolName})`
//                     .then(() => ({ Username: args.Username, Password: args.Password, Location: args.Location, SchoolName: args.SchoolName }));
//             }
//         },
//         Edit:{
//             type:FacultyType,
//             args:{
//                 Username: { type: new GraphQLNonNull(GraphQLString) },
//                 Password: { type: new GraphQLNonNull(GraphQLString) }
//             },
//             resolve(parent,args){
//                 return sql.query`UPDATE Faculty SET Username = ${args.Username}, Password = ${args.Password} WHERE Username = ${args.Username}`
//                     .then(() => ({ Username: args.Username, Password: args.Password }));
//             }
//         }
//     }
// });

const schema = new GraphQLSchema({
    query: RootQuery,
    // mutation: Mutation
});

export default schema;