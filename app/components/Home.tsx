// 'use client';
// import * as React from 'react'
// import { Neo4jUser } from '@/types'
// import TinderCard from 'react-tinder-card'
// import { Card } from '@/components/ui/card'
// import { CardDescription } from '@/components/ui/card'
// import { CardFooter } from '@/components/ui/card'
// import { CardHeader } from '@/components/ui/card'
// import { CardTitle } from '@/components/ui/card'
// import { neo4jSwipe } from '../neo4j.action'




// interface HomepageClientComponentProps {
//     CurrentUser: Neo4jUser;
//     users: Neo4jUser[];
// }
// const HomepageClientComponent: React.FC<HomepageClientComponentProps> = ({
//     CurrentUser,
//     users,
// }) => {
//         const handleSwipe=async (direction:string,applicationId:string)=>{
//             const isMatch=await neo4jSwipe(CurrentUser.applicationId,direction,userId)
//             if(isMatch) alert(`congrats !! Its a match`);
            
//         }
//     return <div className='w-screen h-screen flex justify-center items-center'>
//         <div>
//         <div>

//             <h1 className='text-4xl'>
//                 Hello {CurrentUser.firstname} {CurrentUser.lastname}</h1>
//         </div>
//         <div className='mt-4 relative'>
//             {users.map(users => <TinderCard onSwipe={(direction)=>handleSwipe(direction,users.applicationId)} className='absolute' key={users.applicationId}>
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>{users.firstname} {users.lastname}</CardTitle>
//                         <CardDescription>{users.email}</CardDescription>
//                     </CardHeader>               
//                 </Card>

//             </TinderCard>)}
//         </div>
//     </div>
//     </div>

// };
// export default HomepageClientComponent;
'use client';

import * as React from 'react';
import TinderCard from 'react-tinder-card';

import { Neo4jUser } from '@/types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { neo4jSwipe } from '../neo4j.action';

interface HomepageClientComponentProps {
  CurrentUser: Neo4jUser;
  users: Neo4jUser[];
}

const HomepageClientComponent: React.FC<HomepageClientComponentProps> = ({
  CurrentUser,
  users,
}) => {
  const handleSwipe = async (
    direction: string,
    swipedUserId: string
  ) => {
    const isMatch = await neo4jSwipe(
      CurrentUser.applicationId,
      direction,
      swipedUserId
    );

    if (isMatch) {
      alert('Congrats!! It’s a match 🎉');
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div>
        <h1 className="text-4xl">
          Hello {CurrentUser.firstname} {CurrentUser.lastname}
        </h1>

        <div className="mt-4 relative">
          {users.map((user) => (
            <TinderCard
              key={user.applicationId}
              className="absolute"
              onSwipe={(direction) =>
                handleSwipe(direction, user.applicationId)
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.firstname} {user.lastname}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
              </Card>
            </TinderCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomepageClientComponent;
