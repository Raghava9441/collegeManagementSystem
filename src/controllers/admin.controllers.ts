import { adminDashboardService } from "../services/admin.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const getAdminDashBoard = asyncHandler(async (req: Request, res: Response) => {

    const adminDashboard = await adminDashboardService.getAdminDashboard();

    if (!adminDashboard) {
        throw new ApiError(404, null, "Admin dashboard is not found", undefined, [{ msg: "Admin dashboard is not found" }])
    }

    return res
        .status(200)
        .json(new ApiResponse(200, adminDashboard, "Admin dashboard is fetched successfully"));

})

export {
    getAdminDashBoard
}
