import type { ReactNode } from "react";
import { Avatar, Stack, Text } from "../../src/index.ts";

export const avatarSpecimens: Record<string, ReactNode> = {
  "A photo": <Avatar name="Ada Okafor" src="media/portrait.svg" />,
  "Initials when there is no photo": <Avatar name="Brother Lind" size="large" />,
  "Beside a printed name": (
    <Stack direction="row" gap="snug" align="center">
      <Avatar name="Sister Amaral" size="small" decorative />
      <Text as="span">Sister Amaral</Text>
    </Stack>
  ),
};
