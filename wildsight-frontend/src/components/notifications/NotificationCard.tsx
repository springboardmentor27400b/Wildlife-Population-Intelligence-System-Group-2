import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  User,
  Clock,
} from "lucide-react";

interface Props {
  notification: any;
  onDelete: (id: number) => void;
}

export default function NotificationCard({
  notification,
  onDelete,
}: Props) {

  const icon = () => {

    switch (notification.notificationType) {

      case "SURVEY":
        return (
          <CheckCircle
            className="text-green-600"
            size={24}
          />
        );

      case "ALERT":
        return (
          <AlertTriangle
            className="text-red-600"
            size={24}
          />
        );

      case "WARNING":
        return (
          <AlertTriangle
            className="text-yellow-500"
            size={24}
          />
        );

      default:
        return (
          <Bell
            className="text-blue-600"
            size={24}
          />
        );
    }
  };

  const badge = () => {

    switch (notification.notificationType) {

      case "SURVEY":
        return "bg-green-100 text-green-700";

      case "ALERT":
        return "bg-red-100 text-red-700";

      case "WARNING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-blue-100 text-blue-700";
    }

  };

  return (

    <div
      className={`
      bg-white
      rounded-2xl
      shadow-sm
      border
      p-6
      transition
      hover:shadow-lg
      hover:-translate-y-1

      ${!notification.isRead
        ? "border-l-4 border-l-green-600"
        : ""
      }
      `}
    >

      <div className="flex justify-between">

        <div className="flex gap-4">

          <div className="mt-1">
            {icon()}
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h2 className="text-xl font-bold">

                {notification.title}

              </h2>

              <span
                className={`
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${badge()}
                `}
              >
                {notification.notificationType}
              </span>

              {

                !notification.isRead &&

                <span
                  className="
                  bg-green-600
                  text-white
                  text-xs
                  px-2
                  py-1
                  rounded-full
                  "
                >

                  NEW

                </span>

              }

            </div>

            <p className="text-gray-600 mt-3">

              {notification.message}

            </p>

            <div className="flex gap-6 mt-5 text-sm text-gray-500">

              <div className="flex items-center gap-2">

                <User size={15} />

                {notification.userName}

              </div>

              <div className="flex items-center gap-2">

                <Clock size={15} />

                {new Date(
                  notification.createdAt
                ).toLocaleString()}

              </div>

            </div>

          </div>

        </div>

        <button

          onClick={() =>
            onDelete(notification.notificationId)
          }

          className="
          bg-red-50
          hover:bg-red-100
          rounded-xl
          p-3
          transition
          "

        >

          <Trash2
            className="text-red-600"
            size={20}
          />

        </button>

      </div>

    </div>

  );

}