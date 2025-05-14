import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MapPin, Briefcase } from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { searchUsers } from "@/services/userService";
import { queryKeys } from "@/constant/queryKeys";

const UserSearchPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Lấy các tham số tìm kiếm từ URL
  const [searchParams, setSearchParams] = useState({
    keyword: queryParams.get("keyword") || "",
    role: queryParams.get("role") || "",
    location: queryParams.get("location") || "",
    specialty: queryParams.get("specialty") || "",
    page: parseInt(queryParams.get("page") || "0"),
    size: parseInt(queryParams.get("size") || "10"),
  });

  // State cho form tìm kiếm
  const [formValues, setFormValues] = useState({
    keyword: searchParams.keyword,
    role: searchParams.role,
    location: searchParams.location,
    specialty: searchParams.specialty,
  });

  // Fetch dữ liệu người dùng
  const { data: searchResult, isLoading } = useQuery({
    queryKey: queryKeys.searchUsers(searchParams),
    queryFn: () => searchUsers(axiosPrivate, searchParams),
    enabled:
      !!searchParams.keyword ||
      !!searchParams.role ||
      !!searchParams.location ||
      !!searchParams.specialty,
  });

  // Cập nhật URL khi searchParams thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [searchParams, navigate, location.pathname]);

  // Xử lý khi submit form tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      ...searchParams,
      ...formValues,
      page: 0, // Reset về trang đầu tiên khi tìm kiếm mới
    });
  };

  // Xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    setSearchParams({
      ...searchParams,
      page: newPage,
    });
  };

  // Format vai trò người dùng
  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "EXPERT":
        return "Chuyên gia nông nghiệp";
      case "FARMER":
        return "Nông dân";
      case "SUPPLIER":
        return "Nhà cung cấp";
      default:
        return role || "Người dùng";
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Tìm kiếm người dùng</h1>

        {/* Form tìm kiếm */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Từ khóa tìm kiếm */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Từ khóa</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Tên, email, thông tin..."
                      className="pl-8"
                      value={formValues.keyword}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          keyword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Vai trò */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vai trò</label>
                  <Select
                    value={formValues.role}
                    onValueChange={(value) =>
                      setFormValues({ ...formValues, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả vai trò</SelectItem>
                      <SelectItem value="FARMER">Nông dân</SelectItem>
                      <SelectItem value="EXPERT">Chuyên gia</SelectItem>
                      <SelectItem value="SUPPLIER">Nhà cung cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vị trí */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vị trí</label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Tỉnh, thành phố..."
                      className="pl-8"
                      value={formValues.location}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Chuyên môn */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chuyên môn</label>
                  <div className="relative">
                    <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Lĩnh vực, kỹ năng..."
                      className="pl-8"
                      value={formValues.specialty}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          specialty: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Tìm kiếm
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Kết quả tìm kiếm */}
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loader khi đang tải
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResult?.content.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Tìm thấy{" "}
                  <span className="font-bold">
                    {searchResult.totalElements}
                  </span>{" "}
                  người dùng
                </p>
                <p className="text-sm text-gray-500">
                  Trang {searchResult.page + 1} / {searchResult.totalPages || 1}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResult.content.map((user) => (
                  <Card
                    key={user.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="h-12 bg-gradient-to-r from-green-400 to-blue-500"></div>
                      <div className="p-4 pt-2 relative">
                        <Avatar className="h-16 w-16 absolute -top-8 border-4 border-white">
                          <AvatarImage
                            src={user.imageUrl || "/placeholder-user.jpg"}
                          />
                          <AvatarFallback>
                            {user.userName?.charAt(0) ||
                              user.name?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="ml-20 mb-3">
                          <h3 className="font-semibold truncate">
                            {user.userName || user.name || "Người dùng"}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          {user.email && (
                            <p className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-500"
                              >
                                <rect
                                  width="20"
                                  height="16"
                                  x="2"
                                  y="4"
                                  rx="2"
                                />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                              {user.email}
                            </p>
                          )}

                          {user.location && (
                            <p className="flex items-center gap-2">
                              <MapPin size={16} className="text-red-500" />
                              {user.location}
                            </p>
                          )}

                          {user.specialty && (
                            <p className="flex items-center gap-2">
                              <Briefcase size={16} className="text-amber-500" />
                              {user.specialty}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/profile/${user.id}`)}
                          >
                            Xem hồ sơ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Phân trang */}
              {searchResult.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(0)}
                      disabled={searchResult.page === 0}
                    >
                      Đầu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(searchResult.page - 1)}
                      disabled={searchResult.page === 0}
                    >
                      Trước
                    </Button>

                    {/* Hiển thị các trang */}
                    {Array.from(
                      { length: Math.min(5, searchResult.totalPages) },
                      (_, i) => {
                        // Tính toán số trang để hiển thị xung quanh trang hiện tại
                        let pageToShow;
                        if (searchResult.totalPages <= 5) {
                          pageToShow = i;
                        } else if (searchResult.page < 2) {
                          pageToShow = i;
                        } else if (
                          searchResult.page >
                          searchResult.totalPages - 3
                        ) {
                          pageToShow = searchResult.totalPages - 5 + i;
                        } else {
                          pageToShow = searchResult.page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageToShow}
                            variant={
                              searchResult.page === pageToShow
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageToShow)}
                            className={
                              searchResult.page === pageToShow
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {pageToShow + 1}
                          </Button>
                        );
                      }
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(searchResult.page + 1)}
                      disabled={
                        searchResult.page >= searchResult.totalPages - 1
                      }
                    >
                      Sau
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(searchResult.totalPages - 1)
                      }
                      disabled={
                        searchResult.page >= searchResult.totalPages - 1
                      }
                    >
                      Cuối
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-gray-400 mb-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Không tìm thấy kết quả
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Không tìm thấy người dùng phù hợp với tiêu chí tìm kiếm. Vui
                lòng thử lại với các từ khóa hoặc bộ lọc khác.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UserSearchPage;
