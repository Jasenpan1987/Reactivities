import { observer } from "mobx-react-lite";
import React from "react";
import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import { PredicateKeys } from "../../../app/stores/ActivityStore";
import { useStore } from "../../../app/stores/store";

const ActivityFilters = observer(() => {
  const {
    activityStore: { predicate, setPredicate },
  } = useStore();
  return (
    <>
      <Menu vertical size="large" style={{ width: "100%", marginTop: 26 }}>
        <Header icon="filter" attached color="teal" content="Filters" />
        <Menu.Item
          content="All Activities"
          active={predicate.has(PredicateKeys.all)}
          onClick={() => setPredicate(PredicateKeys.all, true)}
        />
        <Menu.Item
          content="I'm Going"
          active={predicate.has(PredicateKeys.isGoing)}
          onClick={() => setPredicate(PredicateKeys.isGoing, true)}
        />
        <Menu.Item
          content="I'm Hosting"
          active={predicate.has(PredicateKeys.isHost)}
          onClick={() => setPredicate(PredicateKeys.isHost, true)}
        />
      </Menu>
      <Header />
      <Calendar
        onChange={(date: Date) => {
          setPredicate(PredicateKeys.startDate, date);
        }}
        value={(predicate.get(PredicateKeys.startDate) as Date) || new Date()}
      />
    </>
  );
});

export default ActivityFilters;
