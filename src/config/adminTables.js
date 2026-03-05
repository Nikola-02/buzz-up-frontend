import { rules } from "@/plugins/validationMessages.js";

/**
 * Admin CRUD table configuration.
 *
 * Each key is the route slug (/admin/:table).
 * - title / subtitle: page header text
 * - icon: sidebar icon
 * - api: base REST endpoint (GET list, POST create, PUT /:id, DELETE /:id)
 * - columns: array of { key, label, format?, chip? }
 *     - format(value, row): optional formatter for display
 *     - chip: { colorMap } renders the cell as a v-chip
 * - searchKeys: which fields to filter on when searching
 * - form.fields: array of field definitions for create/edit dialog
 *     - key, label, type (text|email|password|date|select|textarea)
 *     - required, rules[], placeholder
 *     - half: true to render side-by-side with next field
 *     - createOnly / editOnly: show field only in that mode
 *     - options: [{ value, title }] for select type
 * - form.defaults: default values for the create form
 * - identifierKey: which field to show in delete confirmation (default: first column)
 */
export const adminTables = {
  users: {
    title: "Users",
    subtitle: "Manage all users in the system",
    icon: "mdi-account-group-outline",
    api: "/users",
    createApi: "/users/register",
    columns: [
      { key: "id", label: "ID" },
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      {
        key: "role",
        label: "Role",
        chip: {
          colorMap: { Admin: "#0f3460" },
          default: "#64748b",
        },
        format: (v) => v || "User",
      },
    ],
    searchKeys: ["username", "email", "firstName", "lastName"],
    identifierKey: "username",
    form: {
      defaults: {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
      },
      fields: [
        { key: "firstName", label: "First Name", type: "text", required: true, rules: [rules.required], half: true, placeholder: "First name" },
        { key: "lastName", label: "Last Name", type: "text", required: true, rules: [rules.required], half: true, placeholder: "Last name" },
        { key: "username", label: "Username", type: "text", required: true, rules: [rules.required], placeholder: "Username" },
        { key: "email", label: "Email", type: "email", required: true, rules: [rules.required, rules.email], placeholder: "Email" },
        {
          key: "password",
          label: "Password",
          editLabel: "New Password",
          type: "password",
          required: false,
          createRules: [rules.required],
          editRules: [],
          placeholder: "Password",
          editPlaceholder: "Leave blank to keep current",
        },
      ],
    },
  },

  roles: {
    title: "Roles",
    subtitle: "Manage user roles",
    icon: "mdi-shield-outline",
    api: "/roles",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
    ],
    searchKeys: ["name"],
    identifierKey: "name",
    form: {
      defaults: { name: "" },
      fields: [
        { key: "name", label: "Role Name", type: "text", required: true, rules: [rules.required], placeholder: "Role name" },
      ],
    },
  },
};

export const adminTableList = Object.entries(adminTables).map(([slug, cfg]) => ({
  slug,
  label: cfg.title,
  icon: cfg.icon,
  route: `/admin/${slug}`,
}));
