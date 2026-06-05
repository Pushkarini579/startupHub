import { IUser } from '../types';

export const formatUserResponse = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
});
