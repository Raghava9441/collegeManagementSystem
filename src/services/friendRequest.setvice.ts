import { FriendRequest } from "@models/friendRequest.models";
import GenericService from "./generic.service";
import { User } from "@models/user.models";
// import validator from "validator";

class FriendRequestService {

    private userService: GenericService<any, any>; // Use IUser and IUserAggregateModel

    constructor() {
        this.userService = new GenericService<any, any>(FriendRequest);
    }

    // search friends
    searchForFriends = async (populatedFriends, keyword, page) => {
        const pageSize = 10; // maximum users to display at once
        let friends = [];
        let totalCount = 0;

        // Extract friend IDs for the search criteria
        const friendIds = populatedFriends.friends.map((friend) => friend._id);

        // Build the search criteria
        const searchCriteria = {
            _id: { $in: friendIds }, // Only search within the friends of the current user
        };

        if (validator.isEmail(keyword)) {
            // If the keyword is an email address, search by email
            searchCriteria.email = keyword;
        } else {
            // If the keyword is not an email, search by combined firstName and lastName
            const combinedNameRegex = new RegExp(keyword, "i"); // 'i' for case-insensitive
            searchCriteria.$or = [
                {
                    $or: [
                        { firstName: combinedNameRegex },
                        { lastName: combinedNameRegex },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $concat: ["$firstName", " ", "$lastName"] },
                                    regex: combinedNameRegex,
                                },
                            },
                        },
                    ],
                },
            ];
        }

        // Perform the search
        friends = await User.find(searchCriteria)
            .select("_id firstName lastName email avatar activityStatus onlineStatus")
            .limit(pageSize)
            .skip(page * pageSize);

        // Get the total count for pagination
        totalCount = await User.countDocuments(searchCriteria);

        return { friends, totalCount };
    };


}


export const friendRequestService = new FriendRequestService()