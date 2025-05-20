
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, PenTool, Image } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import CreateEditPostForm from "./CreateEditPostForm";
import { useState } from "react";

const FormInput = () => {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="p-5 border-b border-gray-100 bg-white rounded-xl shadow-md mb-5 card-3d">
      <form>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-green-100 shadow-sm">
            <AvatarImage
              src={auth?.user?.imageUrl || "/placeholder-user.jpg"}
              alt={auth?.user?.username || auth?.user?.userName || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-400 text-white text-lg font-bold">
              {auth?.user?.username?.charAt(0) ||
                auth?.user?.userName?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-start font-normal text-gray-500 border border-gray-200 hover:border-green-200 hover:bg-green-50 h-12 px-5 rounded-full shadow-sm transition-all"
              >
                Bạn đang nghĩ gì về nông nghiệp hôm nay?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-xl">
              {auth?.user ? (
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-semibold text-gray-800">
                    Tạo bài viết
                  </DialogTitle>
                  <CreateEditPostForm mode="create" onClose={() => setOpen(false)}/>
                </DialogHeader>
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-600 mb-4">
                    Bạn cần đăng nhập để tạo bài viết.
                  </p>
                  <Button
                    variant="default"
                    onClick={() => (window.location.href = "account/login")}
                    className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition"
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex mt-4 pt-3 border-t">
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 gap-2 hover:bg-green-50 hover:text-green-700 transition-all rounded-lg"
          >
            <Image size={18} className="text-blue-500" />
            Ảnh/Video
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 gap-2 hover:bg-green-50 hover:text-green-700 transition-all rounded-lg"
          >
            <Calendar size={18} className="text-green-500" />
            Sự kiện
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 gap-2 hover:bg-green-50 hover:text-green-700 transition-all rounded-lg"
          >
            <PenTool size={18} className="text-amber-500" />
            Viết bài
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormInput;
