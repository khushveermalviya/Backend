import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';
import jwt from "jsonwebtoken";
import sql from 'mssql';
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = "asdfhasdfjkah";

// Define StudentLogin GraphQL Object Type
const StudentLoginType = new GraphQLObjectType({
    name: 'StudentLogin',
    fields: () => ({
        StudentID: { type: GraphQLString },
        FirstName: { type: GraphQLString },
        LastName: { type: GraphQLString },
    }),
});

// Define FaultyLogin GraphQL Object Type
const FaultyLoginType = new GraphQLObjectType({
    name: "FacultyLogin",
    fields: () => ({
        Username: { type: GraphQLString },
        token: { type: GraphQLString },
        School_Id: { type: GraphQLString },
    }),
});

// Define RootQuery
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        studentLogin: {
            type: StudentLoginType,
            args: {
                Username: { type: new GraphQLNonNull(GraphQLString) },
                Password: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                return sql.query`SELECT StudentID, FirstName, LastName FROM Students WHERE StudentID = ${args.Username} AND Password = ${args.Password}`
                    .then(result => result.recordset[0]);
            },
        },
        facultyLogin: {
            type: FaultyLoginType,
            args: {
                Username: { type: new GraphQLNonNull(GraphQLString) },
                Password: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                return sql.query`SELECT Username, Password FROM Faculty WHERE Username = ${args.Username} AND Password = ${args.Password}`
                    .then(async result => {
                        const faculty = result.recordset[0];
                        if (!faculty) {
                            throw new Error("Invalid credentials");
                        }
                        const token = jwt.sign({ username: faculty.Username }, SECRET_KEY, { expiresIn: '1h' });
                        console.log("Generated Token:", token);
                        return {
                            token,
                            Username: faculty.Username,
                        };
                    });
            },
        },
    },
});

// Create GraphQL Schema
const schema = new GraphQLSchema({
    query: RootQuery,
});

// Set Up Apollo Server
const server = new ApolloServer({
    schema,
});

// Start Server
export default schema;