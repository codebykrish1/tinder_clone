import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation";
import { getUserById } from "../neo4j.action";
import { createUser } from "../neo4j.action";

export default async function CallbackPage(){
    const {isAuthenticated,getUser} = getKindeServerSession();
      if(!(await isAuthenticated())) 
    return redirect(
      "api/auth/login?post_login_redirect_url=http://localhost:3000/callback"
    );
    const  user=await getUser();
    
     if(!user)
    return redirect(
      "api/auth/login?post_login_redirect_url=http://localhost:3000/callback");

      const dbUser=await getUserById(user.id);
      if(!dbUser){
        await createUser({applicationId:user.id,firstname:user.given_name!,lastname:user.family_name!,email:user.email!});
      }
     return redirect("/")
    

}
    