import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Header } from "semantic-ui-react";

interface IActivity {
  id: string;
  title: string;
}

function App() {
  const [activities, setActivities] = useState<IActivity[]>([]);

  const loadActivities = async () => {
    const response = await axios.get<IActivity[]>(
      "http://localhost:5000/api/Activities"
    );
    setActivities(response.data);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div>
      <Header as="h2" icon="users" content="Reactivities" />
      <List>
        {activities.map((activity) => (
          <List.Item key={activity.id}>{activity.title}</List.Item>
        ))}
      </List>
    </div>
  );
}

export default App;
