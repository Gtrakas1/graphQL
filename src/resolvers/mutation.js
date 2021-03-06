import bcrypt from 'bcryptjs'
import hashPassword from '../utils/hashPassword'
import generateToken from '../utils/generateToken'
import getUserId from '../utils/getuserid'



const Mutation= {
    

    async login(parent,args, { prisma }, info) {
        const user= await prisma.query.user({
            where:{
                email: args.data.email
            }
        })

        if(!user){
            throw new Error('Unable to login')
        }

        
        const isMatch = await bcrypt.compare(args.data.password,user.password)

        if(!isMatch){
            throw new Error('Unable to Login')
        }

        return{
            user,
            token: generateToken(user.id)

        }


    },
   async createUser(parent,args,{ prisma },info){
   const password = await hashPassword(args.data.password)   
const user = await prisma.mutation.createUser( { data:{
        ...args.data,
        password
    } })

    return{
        user,
        token: generateToken(user.id)
    }
    
},
    
   async deleteUser(parent,args,{ prisma, request },info){
    const userId = getUserId(request)
      
        
    
        return prisma.mutation.deleteUser({where:{id:userId}
         }, info)
    },

 async updateUser(parent,args,{ prisma, request }, info){
    const userId= getUserId(request)
    if(typeof args.data.password === 'string'){
        args.data.password = await hashPassword(args.data.password)
    }
    
    return prisma.mutation.updateUser({
        data: args.data,
        where:{
            id: userId
        }
    },info)

    },
    async createPost(parent,args, { prisma, request },info){
       const userId = getUserId(request)
       
        return prisma.mutation.createPost({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
            author:{
                connect:{
                    id: userId
                } 
            }
        }
        }, info)
       
    },
    async deletePost(parent,args,{ prisma, request} ,info){
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        })

        if(!postExists){
            throw new Error('Unable to delete post')
        }

        return prisma.mutation.deletePost({
            where:{
                id: args.id
            }
        }, info)
    
    },

    async updatePost(parent, args, { prisma, request}, info){
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id: args.id,
            author:{
                id: userId
            }
        })

        const isPublished = await prisma.exists.Post({
            id: args.id,
            published: true
        })

        if(isPublished && args.data.published === false){
            await prisma.mutation.deleteManyComments({
                where: {
                    post:{
                        id: args.id
                    }
                }
            })
        }

        if(!postExists){
            throw new Error('Unable to Authenticate')
        }
      
        return prisma.mutation.updatePost({
        where:{
            id: args.id
        }
        
    },info)
    
     
    },
    
    async createComment(parent,args,{prisma, request},info){
        const userId = getUserId(request)    
        return prisma.mutation.createComment({
        data:{
            text: args.data.text,
            
        author:{
            connect: {
                id:userId
            }
        },
    post: {
     connect: {
         id: args.data.post
    }
    }
}
},info)
    },

    async updateComment(parent,args,{ prisma, request }, info){
     const userId = getUserId(request)
     const commentExists = await prisma.exists.Comment({
         id: args.id,
         author:{
             id: userId
         }
         
     })

     if(!commentExists){

        throw new Error('Unable to update')
     }
        return prisma.mutation.updateComment({
        where:{
        id: args.id 
      },
      data:args.data
    },info)
    },
    
  async deleteComment(parent,args,{ prisma },info){
    const userId = getUserId(request)
    const commentExists = await prisma.exists.Comment({
        id: args.id,
        author:{
            id: userId
        }
        
    })

    if(!commentExists){

       throw new Error('Comment cannot be deleted')
    }
   return prisma.mutation.deleteComment({
        where:{
        id: args.id
        }
    },info)
        
    }
}

        export {Mutation as default}