import { List, ListItem } from "@jpmorganchase/uitk-lab";

type ItemWithLabel = { label: string };
const ITEMS: ItemWithLabel[] = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

["source", "declarative"].forEach((listType) => {
  describe(`A ${listType} List with a selected item`, () => {
    const isDeclarative = listType === "declarative";
    let onChange;
    let onSelect;

    beforeEach(() => {
      onChange = cy.stub().as("changeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        initialSelectedItem: isDeclarative ? "list item 2" : ITEMS[1],
        onChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List {...listProps}>
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel>
            {...listProps}
            initialSelectedItem={ITEMS[1]}
            source={ITEMS}
          />
        )
      );
    });

    it("clicking the selected item should not change selected item", () => {
      cy.findAllByRole("option")
        .eq(1)
        .should("have.class", "uitkListItem-selected");
      cy.findByText("list item 2").realClick();
      cy.get("@changeHandler").should("not.have.been.called");
      cy.get("@selectHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        isDeclarative ? "list item 2" : ITEMS[1]
      );
    });
    it("clicking another item should change selected item", () => {
      cy.findByText("list item 3").realClick();
      cy.findAllByRole("option")
        .eq(1)
        .should("not.have.class", "uitkListItem-selected");
      cy.findAllByRole("option")
        .eq(2)
        .should("have.class", "uitkListItem-selected");
      cy.get("@changeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        isDeclarative ? "list item 3" : ITEMS[2]
      );
      cy.get("@selectHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        isDeclarative ? "list item 3" : ITEMS[2]
      );
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A de-selectable ${listType} List with a selected item`, () => {
    const isDeclarative = listType === "declarative";
    let onChange;
    let onSelect;

    beforeEach(() => {
      onChange = cy.stub().as("changeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        onChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List
            {...listProps}
            initialSelectedItem="list item 2"
            selectionVariant="deselectable"
          >
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel, "deselectable">
            {...listProps}
            initialSelectedItem={ITEMS[1]}
            selectionVariant="deselectable"
            source={ITEMS}
          />
        )
      );
    });

    describe("when selected item is clicked", () => {
      it("should deselect that item", () => {
        cy.findByText("list item 2").realClick();
        cy.findAllByRole("option")
          .eq(1)
          .should("not.have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          null
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );
      });
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A multi-selection ${listType} List`, () => {
    const isDeclarative = listType === "declarative";

    let onChange;
    let onSelect;

    beforeEach(() => {
      onChange = cy.stub().as("changeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        onChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List
            onChange={onChange}
            onSelect={onSelect}
            selectionVariant="multiple"
          >
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel, "multiple">
            {...listProps}
            selectionVariant="multiple"
            source={ITEMS}
          />
        )
      );
    });

    describe("when multiple items are clicked", () => {
      it("should select those items", () => {
        cy.findByText("list item 1").realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 3").realClick();

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 3"] : [ITEMS[0], ITEMS[2]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[2]
        );
      });
    });

    describe("when selected items are clicked one more time", () => {
      it("should deselect those items", () => {
        // to select
        cy.findByText("list item 1").realClick();
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 3").realClick();
        cy.findByText("list item 4").realClick();

        // to deselect
        cy.findByText("list item 1").realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 4").realClick();

        cy.findAllByRole("option")
          .eq(0)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("not.have.class", "uitkListItem-selected");

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });
    });
  });

  ["list", "declarative"].forEach((listType) => {
    describe(`A ${listType} List with multiple selected items`, () => {
      const isDeclarative = listType === "declarative";

      it("should be a multi-selection list", () => {
        const onChange = cy.stub().as("selectHandler");
        cy.mount(
          isDeclarative ? (
            <List<String, "multiple">
              initialSelectedItem={["list item 2", "list item 4"]}
              onChange={onChange}
            >
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          ) : (
            <List<ItemWithLabel, "multiple">
              initialSelectedItem={[ITEMS[1], ITEMS[3]]}
              onChange={onChange}
              source={ITEMS}
            />
          )
        );

        cy.findByText("list item 1").realClick();
        cy.findByText("list item 3").realClick();
        cy.findByText("list item 4").realClick();

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("not.have.class", "uitkListItem-selected");
      });
    });
  });
});

["list", "declarative"].forEach((listType) => {
  describe(`A extended-selection ${listType} List`, () => {
    const isDeclarative = listType === "declarative";
    let onChange;
    let onSelect;

    beforeEach(() => {
      onChange = cy.stub().as("changeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = { onChange, onSelect };

      cy.mount(
        isDeclarative ? (
          <List {...listProps} selectionVariant="extended">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel, "extended">
            {...listProps}
            selectionVariant="extended"
            source={ITEMS}
          />
        )
      );
    });

    describe("when multiple items are clicked", () => {
      it("should change selection if simple click", () => {
        cy.findByText("list item 1").realClick();
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 3").realClick();
        cy.findAllByRole("option")
          .eq(0)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 3"] : [ITEMS[2]]
        );
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });

      it("should select those items if control click is used", () => {
        cy.findByText("list item 1").realClick();
        cy.findByText("list item 3").click({ ctrlKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 3"] : [ITEMS[0], ITEMS[2]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });

      it("should select a range between those items if shift click is used", () => {
        cy.findByText("list item 1").realClick({});

        cy.findByText("list item 4").click({ shiftKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 4" : ITEMS[3]
        );
      });
      it("should not select duplicates if a range overlaps", () => {
        cy.findByText("list item 2").realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );

        cy.findByText("list item 1").click({ shiftKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        // is this right, shouldn't it be 1 ?
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );

        // selecting second range that overlaps with the first
        cy.findByText("list item 4").click({ ctrlKey: true, shiftKey: true });

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );
      });

      it("should deselect first range if new range selected", () => {
        cy.findByText("list item 1").realClick();
        cy.findByText("list item 2").click({ shiftKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range
        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ shiftKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 3", "list item 4"] : [ITEMS[2], ITEMS[3]]
        );
      });

      it("should concatenate first range if new range selected with ctrl shift", () => {
        cy.findByText("list item 1").realClick();
        cy.findByText("list item 2").click({ shiftKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range
        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ shiftKey: true, ctrlKey: true });

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("have.class", "uitkListItem-selected");

        cy.get("@changeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );
      });
    });

    describe("when selected items are clicked one more time", () => {
      it("should deselect all items except for the clicked item", () => {
        // to select
        cy.findByText("list item 1").realClick();

        // to select additional items
        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ ctrlKey: true });

        // to deselect
        cy.findByText("list item 1").realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findAllByRole("option")
          .eq(0)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("not.have.class", "uitkListItem-selected");
      });

      it("should deselect only that item if control click is used", () => {
        // to select
        cy.findByText("list item 1").realClick();

        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ ctrlKey: true });

        // to deselect
        cy.findByText("list item 1").click({ ctrlKey: true });

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findAllByRole("option")
          .eq(0)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(1)
          .should("not.have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(2)
          .should("have.class", "uitkListItem-selected");
        cy.findAllByRole("option")
          .eq(3)
          .should("have.class", "uitkListItem-selected");
      });
    });
  });
});
