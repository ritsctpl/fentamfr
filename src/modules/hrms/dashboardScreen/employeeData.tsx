/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Avatar, Button, Carousel, Empty, Badge, DatePicker } from "antd";
import { LeftOutlined, RightOutlined, BellOutlined } from "@ant-design/icons";
import { useEffect } from "react";

// Dummy Data
const dummyData = {
  birthdays: [
    {
      id: 1,
      name: "John Doe",
      department: "test",
      profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
      birthDate: "2024-11-19",
      designation: "Senior Developer",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Town Hall Meeting",
      priority: "high",
      date: "2024-03-20",
      description: "Quarterly town hall meeting at 3 PM",
    },
    {
      id: 2,
      title: "System Maintenance",
      priority: "medium",
      date: "2024-03-22",
      description: "Scheduled system maintenance from 10 PM",
    },
  ],
};

// Add this helper function at the top level
const isToday = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  return (
    today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth()
  );
};

const getUpcomingBirthday = (birthdays: any[]) => {
  const today = new Date();
  return birthdays.find((birthday) => {
    const birthDate = new Date(birthday.birthDate);
    // Compare only month and day
    if (
      birthDate.getMonth() > today.getMonth() ||
      (birthDate.getMonth() === today.getMonth() &&
        birthDate.getDate() >= today.getDate())
    ) {
      return true;
    }
    return false;
  });
};

const EmployeeData: React.FC = () => {
  const carouselRef = React.useRef<any>();
  const [holidays, setHolidays] = React.useState<any[]>([]);

  const nextHoliday = () => {
    carouselRef.current?.next();
  };

  const previousHoliday = () => {
    carouselRef.current?.prev();
  };

  // Add current date handling
  const getCurrentMonthYear = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Add date picker handler
  const onDateChange = (date: any) => {
    // Handle date change here
    console.log("Selected date:", date);
  };

  const upcomingBirthday = getUpcomingBirthday(dummyData.birthdays);
  const isTodayBirthday = upcomingBirthday
    ? isToday(upcomingBirthday.birthDate)
    : false;

  // Add function to format title date
  const getFormattedTitleDate = (birthDate: string) => {
    return new Date(birthDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  // Update useEffect to store fetched holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          "https://mocki.io/v1/eeff312f-bd4f-44d3-b7d5-e6476bd35bd7"
        );
        const data = await response.json();
        console.log("Fetched holidays:", data);
        setHolidays(data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
  }, []);

  return (
    <div className="dashboard">
      {/* Birthday Card */}
      <div className="card">
        <div className="card-header">
          <div className="birthday-title">
            <h2>
              🎂{" "}
              {isTodayBirthday
                ? "Today's Birthday"
                : `Upcoming Birthday (${
                    upcomingBirthday
                      ? getFormattedTitleDate(upcomingBirthday.birthDate)
                      : ""
                  })`}
            </h2>
          </div>
        </div>
        <div className="card-content">
          {upcomingBirthday ? (
            <div className="birthday-container">
              <div className="profile-section">
                <div className="profile-frame">
                  <div className="decoration-top">
                    <span className="decoration-icon">🎂</span>
                  </div>
                  <Avatar
                    size={120}
                    src={upcomingBirthday.profilePic}
                    className={`profile-avatar ${
                      isTodayBirthday ? "birthday-today" : ""
                    }`}
                  />
                  <div className="decoration-bottom">
                    <span className="decoration-icon">✨</span>
                  </div>
                </div>
              </div>
              <div className="info-section">
                <div className="employee-header">
                  <h3 className="employee-name">{upcomingBirthday.name}</h3>
                  <div className="employee-title">
                    {upcomingBirthday.designation}
                  </div>
                </div>
                <div className="employee-details">
                  <div className="detail-row">
                    <div className="detail-label">Team</div>
                    <div className="detail-value">Development Team</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Department</div>
                    <div className="detail-value">
                      {upcomingBirthday.department}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Birthday</div>
                    <div className="detail-value highlight">
                      {new Date(upcomingBirthday.birthDate).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                        }
                      )}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Employee ID</div>
                    <div className="detail-value">
                      EMP-{upcomingBirthday.id}
                    </div>
                  </div>
                </div>
                {isTodayBirthday && (
                  <Button type="primary" className="wish-button">
                    <span className="button-icon">🎉</span>
                    Send Birthday Wishes
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Empty
              description="No upcoming birthdays"
              className="empty-state"
            />
          )}
        </div>
      </div>

      {/* Holiday Card */}
      <div className="card">
        <div className="card-header">
          <div className="holiday-header">
            <h2>Upcoming Holidays ({getCurrentMonthYear()})</h2>
            {/* <span className="month-year">{getCurrentMonthYear()}</span> */}
          </div>
          <div className="header-controls">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={previousHoliday}
            />
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={nextHoliday}
            />
          </div>
        </div>
        <div className="card-content holiday-card-content">
          <Carousel ref={carouselRef} dots={false}>
            {holidays.length > 0 ? (
              holidays.map((holiday) => {
                console.log("Rendering holiday:", holiday);
                return (
                  <div key={holiday.id} className="holiday-content">
                    <div className="holiday-image-container">
                      <img
                        src={
                          holiday.urlimage ||
                          "https://cdn.textstudio.com/output/sample/normal/1/1/4/5/holiday-logo-73-15411.webp"
                        }
                        alt={holiday.name}
                      />
                    </div>
                    <div className="holiday-info">
                      <div className="holiday-header">
                        <div className="holiday-date-badge">
                          {new Date(holiday.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <div className="holiday-type-badge">
                          {holiday.type || "Regular Holiday"}
                        </div>
                      </div>
                      <h3>{holiday.name}</h3>
                      <p className="holiday-description">
                        {holiday.description
                          ? holiday.description
                          : "No description available"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>Loading holidays...</div>
            )}
          </Carousel>
        </div>
      </div>

      {/* Notifications Card */}
      <div className="card">
        <div className="card-header">
          <h2>
            <BellOutlined /> Important Updates
          </h2>
          <DatePicker
            onChange={onDateChange}
            format="DD/MM/YYYY"
            placeholder="Select date"
            className="date-picker"
          />
        </div>
        <div className="card-content">
          <div className="notifications-wrapper">
            {dummyData.notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <Badge.Ribbon
                  text={notification.priority}
                  color={
                    notification.priority === "high" ? "#ff4d4f" : "#1890ff"
                  }
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p className="notification-date">
                      {new Date(notification.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="notification-desc">
                      {notification.description}
                    </p>
                  </div>
                </Badge.Ribbon>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          gap: 12px;
          padding: 12px;
          width: 100%;
          box-sizing: border-box;
          background: #f5f7fb;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .card {
          flex: 1;
          min-width: 300px;
          max-width: calc(33.33% - 8px);
          background: white;
          border-radius: 8px;
          box-shadow: 0 3px 4px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid #eef2f8;
        }

        .card-header h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
        }

        .card-content {
          padding: 16px;
          height: 220px;
          overflow: hidden;
        }

        .birthday-title h2 {
          font-size: 16px;
        }

        .birthday-container {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          gap: 30px;
          height: 100%;
        }

        .profile-section {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .profile-frame {
          position: relative;
          padding: 10px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .decoration-top,
        .decoration-bottom {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .decoration-top {
          top: -15px;
        }

        .decoration-bottom {
          bottom: -15px;
        }

        .decoration-icon {
          font-size: 16px;
        }

        .profile-avatar {
          border: 3px solid #1890ff !important;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        }

        .profile-avatar.birthday-today {
          border-color: #ff4d4f !important;
          animation: gentle-pulse 2s infinite;
        }

        .info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .employee-header {
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .employee-name {
          font-size: 24px;
          font-weight: 600;
          color: #262626;
          margin: 0 0 8px 0;
        }

        .employee-title {
          font-size: 14px;
          color: #1890ff;
          font-weight: 500;
        }

        .employee-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          padding: 8px 0;
        }

        .detail-label {
          flex: 0 0 120px;
          font-size: 13px;
          color: #8c8c8c;
          font-weight: 500;
        }

        .detail-value {
          flex: 1;
          font-size: 14px;
          color: #262626;
          font-weight: 500;
        }

        .detail-value.highlight {
          color: #1890ff;
        }

        .wish-button {
          margin-top: 10px;
          height: 40px;
          border-radius: 6px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #1890ff;
          border: none;
          transition: all 0.3s ease;
        }

        .wish-button:hover {
          background: #096dd9;
          transform: translateY(-1px);
        }

        .button-icon {
          font-size: 16px;
        }

        @keyframes gentle-pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        .holiday-card-content {
          padding: 15px;
          height: 230px;
        }

        .holiday-content {
          // height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #fff;
          border-radius: 8px;
          overflow: visible;
        }

        .holiday-image-container {
          width: 100%;
          height: 100px;
          position: relative;
          overflow: hidden;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .holiday-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .holiday-info {
          width: 100%;
          padding: 12px;
          text-align: center;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .holiday-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .holiday-date-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e8f3ff;
          color: #1890ff;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
        }

        .holiday-type-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #f6f3ff;
          color: #722ed1;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
        }

        .holiday-info h3 {
          margin: 8px 0;
          font-size: 15px;
          color: #2c3e50;
          font-weight: 600;
          line-height: 1.3;
          text-align: center;
        }

        .holiday-description {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
          line-height: 1.4;
          text-align: center;
          overflow: visible;
          text-overflow: ellipsis;
          display: block;
          max-width: 100%;
          padding: 0 8px;
          word-wrap: break-word;
          min-height: 36px;
          margin-bottom: 4px;
        }

        .header-controls {
          display: flex;
          // gap: 8px;
        }

        .header-controls button {
          // padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-controls button:hover {
          color: #1890ff;
          background: #e8f3ff;
        }

        .notification-content {
          padding: 12px;
        }

        .notification-content h4 {
          font-size: 13px;
          margin: 0 0 6px 0;
        }

        .notification-date {
          font-size: 11px;
          margin: 0 0 4px 0;
        }

        .notification-desc {
          font-size: 11px;
        }

        @media (max-width: 1200px) {
          .dashboard {
            flex-direction: column;
          }

          .card {
            width: 100%;
            max-width: 100%;
            margin-bottom: 15px;
            min-height: 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeData;
