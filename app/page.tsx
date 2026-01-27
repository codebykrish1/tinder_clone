import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation";
import { getUserswithNoConnection } from "@/app/neo4j.action";
import HomepageClientComponent from "./components/Home";
import { getUserById } from "./neo4j.action";

export default async  function Home() {
  const {isAuthenticated,getUser} = getKindeServerSession();
  if(!(await isAuthenticated())) {
    return redirect(
      "api/auth/login?post_login_redirect_url=http://localhost:3000/callback"
    );
  }
  const user=await getUser();
  if(!user)
    return redirect(
      "api/auth/login?post_login_redirect_url=http://localhost:3000/callback");

  const usersWithNoConnection=await getUserswithNoConnection(user.id);
  const currentUser=await getUserById(user.id);
  return (
    <main>
    {currentUser && (<HomepageClientComponent CurrentUser={currentUser} users={usersWithNoConnection}/>)}
      Hii{user.given_name}
      <pre>
        <code>{JSON.stringify(usersWithNoConnection,null,2)} </code>

      </pre>

    </main>
  );
}

