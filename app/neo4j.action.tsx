'use server'
import {driver } from '@/db';
import { Neo4jUser } from '@/types';
import { appRouterContext } from 'next/dist/server/route-modules/app-route/shared-modules';
export const getUserById=async (id:string)=>{
    const result=await driver.executeQuery(
        `MATCH (u: User{applicationId:$applicationId}) RETURN u`,
        {applicationId:id}
    ); 
    const users= result.records.map((record)=>record.get("u").properties);
    if (users.length === 0) return null; // No user
    return users[0]as Neo4jUser;


};

export const createUser=async (user:Neo4jUser)=>{
    const {applicationId,firstname,lastname,email}=user;
    const result=await driver.executeQuery(
        `CREATE (u:User {applicationId:$applicationId,firstname:$firstname,lastname:$lastname,email:$email}) RETURN u`,
        {applicationId,firstname,lastname,email}
    );
    const users= result.records.map((record)=>record.get("u").properties);
    if (users.length === 0) return null; // No user
    return users[0]as Neo4jUser;
}
export const getUserswithNoConnection=async(id:string)=>{
    const result = await driver.executeQuery(
        'MATCH (cu: User{applicationId:$applicationId}) MATCH(ou:User) WHERE NOT(cu)-[:LIKE|:DISLIKE]-(ou) AND cu <> ou RETURN ou',
        {applicationId:id}
    );
    const users=result.records.map((record)=>record.get("ou").properties);
    return users as Neo4jUser[];

} 

export const neo4jSwipe=async(
    id:string,
    swipe:string,
    userId:string
)=>{
    const type=swipe==='left'?"DISLIKE":"LIKE";
    await driver.executeQuery(
        `MATCH (cu: User{applicationId:$id}), (ou:User{applicationId:$userId})CREATE (cu)-[:${type}]->(ou)`,
        {
            id,
            userId
        }
    );
    if(type==='LIKE'){
        const result = await driver.executeQuery(
  `MATCH (cu: User{applicationId:$id}), (ou:User{applicationId:$userId}) WHERE (ou)-[:LIKE]->(cu) RETURN ou as match`,
  {
    id,
    userId
  }
);
const matches=result.records.map(
    (record)=>record.get("match").properties
);
return Boolean(matches.length>0);

    }


};


