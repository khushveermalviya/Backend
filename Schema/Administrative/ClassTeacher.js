import {GraphQLObjectType,GraphQLInt,GraphQLString,GraphQLList} from "graphql"

import sql from  "mssql"
 
const ClassTeacherType = new GraphQLObjectType({
    name: "ClassTeacher",
    fields: () => ({
      first_name: { type: GraphQLString },
      last_name: { type: GraphQLString },
      role: { type: GraphQLString },
      Class: { type: GraphQLInt }
    })
  });
  
  const ClassTeacherQuery = {
    type: new GraphQLList(ClassTeacherType),
    async resolve(parent) {
      try {
        const result = await sql.query`
          SELECT first_name, last_name, role, Class FROM Staff
        `;
        return result.recordset;
      } catch (err) {
        throw new Error("Error fetching staff data: " + err.message);
      }
    }
  };

const ClassMutation = {
type:ClassTeacherType,


}
export {ClassTeacherQuery}
    


