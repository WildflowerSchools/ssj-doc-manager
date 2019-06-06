import React from "react"

import { withStyles } from "@material-ui/core"
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward"

const AnimatedArrowUpwardIcon = withStyles({
  root: {
    transform:
      "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
  }
})(ArrowUpwardIcon)

class OrderBy extends React.Component {
  constructor(props) {
    super(props)

    this.setOrderBy = props.setOrderBy
    this.fields = props.fields

    this.state = {
      active: "",
      direction: "asc"
    }
  }

  onOrderBySelected = field => {
    let newActive = field,
      newDirection = "asc"

    if (this.state.active === field) {
      if (this.state.direction === "asc") {
        newDirection = "desc"
      }
    }

    this.setState({ active: newActive, direction: newDirection }, () => {
      this.setOrderBy(this.state.active, this.state.direction)
    })
  }

  getArrowClassNames = field => {
    if (this.state.active === field) {
      if (this.state.direction === "desc") {
        return "iconDirectionDesc"
      }
    } else {
      return "iconHidden"
    }

    return ""
  }

  render() {
    const orderByListUl = {
      listStyleType: "none",
      margin: "0",
      padding: "0",
      overflow: "hidden"
    }

    const orderByListLi = {
      cursor: "pointer",
      float: "left",
      display: "inline-flex",
      alignItems: "center",
      flexDirection: "inherit",
      justifyContent: "flex-start",
      marginLeft: "10px"
    }

    const orderByListItems = this.fields.map(f => {
      return (
        <li
          key={`order-by-${f.name}`}
          style={orderByListLi}
          onClick={() => {
            this.onOrderBySelected(f.name)
          }}
        >
          <span>
            <AnimatedArrowUpwardIcon
              className={"iconAnimated " + this.getArrowClassNames(f.name)}
              fontSize="small"
            />
            &nbsp;
          </span>
          {f.public}
        </li>
      )
    })

    return (
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <h4>
          <b>Order By:</b>
        </h4>
        <ul style={orderByListUl}>{orderByListItems}</ul>
      </div>
    )
  }
}

export default OrderBy
