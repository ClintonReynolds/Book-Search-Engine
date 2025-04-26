import User from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js";
console.log(AuthenticationError);

// define interface for resolver context & book data
interface Context {
  user?: {
      _id: string;
      username: string;
      email: string;
  };
}

interface BookData {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image?: string;
  link?: string;
}

interface UserDocument {
  _id: string;
  username: string;
  email: string;
  password: string;
  bookCount: number;
  savedBooks: BookData[];
  isCorrectPassword: (password: string) => Promise<boolean>;
}

export const resolvers = {
    Query: {
        me: async (_parent: undefined, _args: undefined, context: Context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError("You need to be logged in!");
        },
    },

    Mutation: {
        addUser: async (
            _parent: undefined,
            {
                username,
                email,
                password,
            }: { username: string; email: string; password: string }
        ) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        login: async (
            _parent: undefined,
            { email, password }: { email: string; password: string }
        ) => {
            const user = (await User.findOne({ email })) as UserDocument;

            if (!user) {
                throw new AuthenticationError("No user found with this email address");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const token = signToken(user.username, user.email, user._id);

            return { token, user };
        },
    
        saveBook: async (
            _parent: undefined,
            { bookData }: { bookData: BookData },
            context: Context
        ) => {
            console.log(context.user)
            if (context.user) {

                return User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );
            }
            throw AuthenticationError;
        },
  
        removeBook: async (
            _parent: undefined,
            { bookId }: { bookId: string },
            context: Context
        ) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError("You need to be logged in!");
        },
    },
};

export default resolvers;