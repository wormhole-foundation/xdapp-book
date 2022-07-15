import { useTimer } from "react-timer-hook";

type CountdownProps = {
  expiryTimestamp: Date;
  expireCallback: Function;
};

const Countdown = ({ expiryTimestamp, expireCallback }: CountdownProps) => {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp,
    onExpire: () => expireCallback(),
  });

  return (
    <>
      <span>{days}</span> days, <span>{hours}</span> hours,{" "}
      <span>{minutes}</span> minutes, <span>{seconds}</span> seconds
    </>
  );
};

export default Countdown;
