export interface CreateUserDTO {
	email: string;
	password: string;
}

export interface UserResponseDTO {
	id: string;
	email: string;
}

export const toUserResponseDTO = (
	user: { id: string; email: string; [key: string]: any } | null | undefined
): UserResponseDTO => {
	if (!user) {
		throw new Error('USER_NOT_FOUND');
	}
	return {
		id: user.id,
		email: user.email,
	};
};
