import { useEffect, useMemo, useState } from "react";

import {
  getAllNotifications,
  deleteNotification,
} from "../services/notificationService";

import NotificationCard from "../components/notifications/NotificationCard";
import AnalyticsCard from "../components/analytics/AnalyticsCard";

import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";

export default function Notifications() {

  const [notifications, setNotifications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    getAllNotifications()
      .then(setNotifications)
      .catch(console.error);
  };

  const handleDelete = async (id: number) => {

    if (!window.confirm("Delete this notification?"))
      return;

    await deleteNotification(id);

    loadNotifications();

  };

  const total = notifications.length;

  const unread = notifications.filter(
    n => !n.isRead
  ).length;

  const alerts = notifications.filter(
    n =>
      n.notificationType === "ALERT" ||
      n.notificationType === "WARNING"
  ).length;

  const today = notifications.filter(n => {

    const d = new Date(n.createdAt);

    const now = new Date();

    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );

  }).length;

  const filteredNotifications = useMemo(() => {

    return notifications.filter(n => {

      const searchMatch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());

      const filterMatch =
        filter === "ALL" ||
        n.notificationType === filter;

      return searchMatch && filterMatch;

    });

  }, [notifications, search, filter]);

  return (

    <div className="p-8 space-y-8 bg-[#f7faf7] min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">
            Notifications 🔔
          </h1>

          <p className="text-gray-500 mt-2">
            Stay updated with wildlife events and system alerts
          </p>

        </div>

      </div>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <AnalyticsCard
          title="Total"
          value={total}
          icon={<Bell size={24} />}
          color="bg-green-600"
        />

        <AnalyticsCard
          title="Unread"
          value={unread}
          icon={<Clock size={24} />}
          color="bg-blue-600"
        />

        <AnalyticsCard
          title="Alerts"
          value={alerts}
          icon={<AlertTriangle size={24} />}
          color="bg-red-600"
        />

        <AnalyticsCard
          title="Today's"
          value={today}
          icon={<CheckCircle size={24} />}
          color="bg-purple-600"
        />

      </div>

      {/* SEARCH */}

      <div className="flex flex-col md:flex-row justify-between gap-4">

        <div className="relative w-full md:w-96">

          <Search
            size={18}
            className="absolute left-3 top-4 text-gray-400"
          />

          <input

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            placeholder="Search notification..."

            className="
            w-full
            border
            rounded-xl
            py-3
            pl-10
            pr-4
            shadow-sm
            "

          />

        </div>

        <select

          value={filter}

          onChange={(e) =>
            setFilter(e.target.value)
          }

          className="
          border
          rounded-xl
          px-4
          py-3
          shadow-sm
          "

        >

          <option value="ALL">All</option>

          <option value="SURVEY">
            Survey
          </option>

          <option value="WARNING">
            Warning
          </option>

          <option value="ALERT">
            Alert
          </option>

        </select>

      </div>

      {/* LIST */}

      <div className="space-y-5">

        {

          filteredNotifications.length > 0 ?

            filteredNotifications.map(n => (

              <NotificationCard

                key={n.notificationId}

                notification={n}

                onDelete={handleDelete}

              />

            ))

            :

            <div className="
            bg-white
            rounded-2xl
            shadow
            p-12
            text-center
            ">

              <Bell
                size={60}
                className="mx-auto text-gray-400"
              />

              <h2 className="text-2xl font-bold mt-4">

                No Notifications

              </h2>

              <p className="text-gray-500 mt-2">

                Everything looks good 🎉

              </p>

            </div>

        }

      </div>

    </div>

  );

}