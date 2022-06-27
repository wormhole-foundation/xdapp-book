Step 1:

Escrow required funds on chain A, send proposal VAA

Step 2:

If proposal VAA is accepted, escrow the required funds on B and send an ACK VAA
Otherwise, send a NACK

Step 3:
If NACK is received, roll back to state zero.
If a sufficient timeout is exceeded, roll back to state zero
