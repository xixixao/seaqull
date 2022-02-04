import { Button } from "editor/ui/Button";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Link } from "editor/ui/Link";
import { Row } from "editor/ui/Row";
import React, { useState } from "react";
import dvdRentalURL from "../../sqlite_examples/dvd_rental.db?url";
import { database } from "../database";
import { useSetSQLiteState } from "../sqliteState";
import { Dialog, DialogContent } from "../ui/Dialog";

export function WelcomeDialog({ defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const close = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent css={{ padding: "$20", borderRadius: "$8" }}>
        <h1>Welcome to Seaqull(beta)!</h1>
        <br />
        <p>
          This is the SQLite version of{" "}
          <Link href="https://github.com/xixixao/seaqull" newtab>
            Seaqull
          </Link>
          .
        </p>
        <p>
          Would you like to explore the example database or one of your own?
        </p>
        <br />
        <Row>
          <ButtonUseExampleDatabase onDone={close}>
            Example database
          </ButtonUseExampleDatabase>
          <HorizontalSpace />
          <ButtonOpenFile onDone={close}>Open a database file</ButtonOpenFile>
        </Row>
      </DialogContent>
    </Dialog>
  );
}

function ButtonUseExampleDatabase({ onDone, children }) {
  const setSQLiteState = useSetSQLiteState();
  return (
    <Button
      onClick={() => {
        (async () => {
          const editorConfig = await database(await loadHostedDatabase());
          setSQLiteState((state) => ({
            editorConfig,
            source: {
              type: "example",
              name: "dvd_rental.db",
            },
          }));
          onDone();
        })();
      }}
    >
      {children}
    </Button>
  );
}

function ButtonOpenFile({ children, onDone }) {
  const setSQLiteState = useSetSQLiteState();
  return (
    <Button
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", () => {
          (async () => {
            const file = input.files[0];
            const { name } = file;
            const editorConfig = await database(await file.arrayBuffer());
            setSQLiteState((state) => ({
              editorConfig,
              source: { type: "file", name },
            }));
          })();
          onDone();
        });
        input.click();
      }}
    >
      {children}
    </Button>
  );
}

export async function loadHostedDatabase() {
  return await (await fetch(dvdRentalURL)).arrayBuffer();
}
