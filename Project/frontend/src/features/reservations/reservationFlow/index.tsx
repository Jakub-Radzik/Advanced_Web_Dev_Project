/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Group, Stepper } from "@mantine/core";
import { useEffect, useState } from "react";
import { Show } from "../../../types/show";
import { Cinema } from "../cinema";
import { useReservationContext } from "../state";
import { Confirmation } from "./components/confirmation";
import { MovieSelection } from "./components/movieSelection";
import { ClientConfirmation } from "./components/clientConfirmation";
import { useScreenings } from "../../../hooks/useScreenings";
import { useParams } from "react-router-dom";

export const ReservationFlow = () => {
  const [active, setActive] = useState(0);
  const [, setHighestStepVisited] = useState(active);
  const { reservation } = useReservationContext();
  let { showId } = useParams();
  const [show, setShow] = useState<Show | null>(null);

  const { getScreening } = useScreenings();

  useEffect(() => {
    if (showId) {
      getScreening(showId).then(data => setShow(data.show));
    }
  }, [showId]);

  const handleStepChange = (nextStep: number) => {
    const isOutOfBounds = nextStep > 4 || nextStep < 0;

    if (isOutOfBounds) {
      return;
    }

    setActive(nextStep);
    setHighestStepVisited(hSC => Math.max(hSC, nextStep));
  };

  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (active === 1 && !reservation.length) {
      setDisabled(true);
      return;
    }
    setDisabled(false);
  }, [active, reservation]);

  return (
    <>
      <Stepper
        active={active}
        onStepClick={setActive}
        breakpoint='sm'
        allowNextStepsSelect={false}
      >
        <Stepper.Step
          label='Wybór seansu'
          description='Potwierdź wybrany film'
          allowStepSelect={false}
        >
          {show ? <MovieSelection show={show} /> : <Box>Ładowanie...</Box>}
        </Stepper.Step>

        <Stepper.Step
          label='Wybór miejsc'
          description='Wybierz miejsca i bilety'
        >
          {show ? (
            <Cinema soldSeats={show.soldSeats} room={show.room} />
          ) : (
            <Box>Ładowanie...</Box>
          )}
        </Stepper.Step>

        <Stepper.Step
          label='Potwierdzenie rezerwacji'
          description='Potwierdź miejsca i bilety'
          allowStepSelect={!!reservation.length}
        >
          <Confirmation />
        </Stepper.Step>

        <Stepper.Step label='Dane osobowe' description='Podaj dane kupującego'>
          <ClientConfirmation onSubmitCallback={() => handleStepChange(4)} />
        </Stepper.Step>

        <Stepper.Completed>
          <Box>Completed, click back button to get to previous step</Box>
        </Stepper.Completed>
      </Stepper>

      <Group position='center' mt='xl'>
        <Button variant='default' onClick={() => handleStepChange(active - 1)}>
          Back
        </Button>
        <Button
          disabled={disabled}
          onClick={() => handleStepChange(active + 1)}
        >
          Next step
        </Button>
      </Group>
    </>
  );
};
