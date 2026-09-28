import { rules } from "@/plugins/validationMessages.js";
import { formatApiDateTime } from "@/services/dates";

/** Same emojis as Home / Profile / Post cards (`feelingTypeId`). */
export const postFeelingEmojiById = {
  1: "😊",
  2: "😢",
  3: "🤩",
  4: "😠",
  5: "🤔",
  6: "😍",
};

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
 *     - key, label, type (text|email|password|date|select|textarea|imageUpload|countrySelect)
 *     - required, rules[], placeholder
 *     - half: true to render side-by-side with next field
 *     - createOnly / editOnly: show field only in that mode
 *     - options: [{ value, title }] for select type
 *     - optionsApi: GET path that returns { id, name } (and optional icon) for select items
 * - form.defaults: default values for the create form
 * - identifierKey: which field to show in delete confirmation (default: first column)
 */
export const adminTables = {
  users: {
    title: "Users",
    subtitle: "Manage all users in the system",
    icon: "mdi-account-group-outline",
    api: "/users",
    columns: [
      { key: "id", label: "ID" },
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      {
        key: "image",
        label: "Image",
        type: "image",
        format: (v) => `http://localhost:5001/temp/${v || "default.png"}`,
      },
      {
        key: "dateOfBirth",
        label: "Date of Birth",
        format: (v) => (v ? new Date(v).toLocaleDateString() : ""),
      },
      {
        key: "createdAt",
        label: "Created At",
        format: (v) => formatApiDateTime(v),
      },
      {
        key: "isActive",
        label: "Is Active",
        chip: {
          colorMap: { true: "#22c55e", false: "#ef4444" },
          default: "#64748b",
        },
        format: (v) => (v ? "true" : "false"),
      },
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
          type: "password",
          required: false,
          createRules: [
            (v) => (typeof v === "string" ? v.trim().length > 0 : !!v) || "Password is required",
          ],
          editRules: [],
          // Keep input visually empty until user types (no placeholder text pre-filling).
          placeholder: "",
          editPlaceholder: "",
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
      {
        key: "isActive",
        label: "Is Active",
        chip: {
          colorMap: { true: "#22c55e", false: "#ef4444" },
          default: "#64748b",
        },
        format: (v) => (v ? "true" : "false"),
      },
      {
        key: "createdAt",
        label: "Created At",
        format: (v) => formatApiDateTime(v),
      },
    ],
    searchKeys: ["name", "isActive", "createdAt"],
    identifierKey: "name",
    form: {
      defaults: { name: "" },
      fields: [
        { key: "name", label: "Role Name", type: "text", required: true, rules: [rules.required], placeholder: "Role name" },
      ],
    },
  },

  countries: {
    title: "Countries",
    subtitle: "Lookup used on user profiles",
    icon: "mdi-earth",
    api: "/countries",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      {
        key: "isActive",
        label: "Is Active",
        chip: {
          colorMap: { true: "#22c55e", false: "#ef4444" },
          default: "#64748b",
        },
        format: (v) => (v ? "true" : "false"),
      },
      {
        key: "createdAt",
        label: "Created At",
        format: (v) => formatApiDateTime(v),
      },
    ],
    searchKeys: ["name"],
    identifierKey: "name",
    form: {
      defaults: { name: "" },
      fields: [
        { key: "name", label: "Country Name", type: "text", required: true, rules: [rules.required], placeholder: "Country name" },
      ],
    },
  },

  feelingTypes: {
    title: "Feeling Types",
    subtitle: "Feelings shown when creating a post",
    icon: "mdi-emoticon-outline",
    api: "/feelingTypes",
    columns: [
      { key: "id", label: "ID" },
      { key: "icon", label: "Icon" },
      { key: "name", label: "Name" },
      {
        key: "createdAt",
        label: "Created At",
        format: (v) => formatApiDateTime(v),
      },
    ],
    searchKeys: ["name", "icon"],
    identifierKey: "name",
    form: {
      defaults: { name: "", icon: "" },
      fields: [
        { key: "name", label: "Name", type: "text", required: true, rules: [rules.required], placeholder: "Happy", half: true },
        { key: "icon", label: "Icon", type: "text", required: true, rules: [rules.required], placeholder: "😊", half: true },
      ],
    },
  },

  reactionTypes: {
    title: "Reaction Types",
    subtitle: "Emojis in the Like picker",
    icon: "mdi-heart-outline",
    api: "/reactionTypes",
    columns: [
      { key: "id", label: "ID" },
      { key: "icon", label: "Icon" },
      { key: "name", label: "Name" },
      {
        key: "createdAt",
        label: "Created At",
        format: (v) => formatApiDateTime(v),
      },
    ],
    searchKeys: ["name", "icon"],
    identifierKey: "name",
    form: {
      defaults: { name: "", icon: "" },
      fields: [
        { key: "name", label: "Name", type: "text", required: true, rules: [rules.required], placeholder: "Like", half: true },
        { key: "icon", label: "Icon", type: "text", required: true, rules: [rules.required], placeholder: "👍", half: true },
      ],
    },
  },

  posts: {
    title: "Posts",
    subtitle: "Posts with visibility, feeling and author",
    icon: "mdi-post-outline",
    api: "/posts",
    columns: [
      { key: "id", label: "ID" },
      { key: "title", label: "Title" },
      { key: "username", label: "Author" },
      { key: "visibilityName", label: "Visibility" },
      {
        key: "feelingName",
        label: "Feeling",
        format: (v, row) => {
          const emoji = postFeelingEmojiById[row.feelingTypeId] || row.feelingIcon || "";
          if (!emoji && !v) return "";
          return emoji ? `${emoji} ${v || ""}`.trim() : v;
        },
      },
      {
        key: "images",
        label: "Image",
        type: "image",
        emptyText: "/",
        format: (v) => {
          const fileName = Array.isArray(v) && v[0];
          return fileName ? `http://localhost:5001/temp/${fileName}` : "";
        },
      },
      {
        key: "createdAt",
        label: "Created At",
        format: (v) => formatApiDateTime(v),
      },
    ],
    searchKeys: ["title", "username"],
    identifierKey: "title",
    form: {
      defaults: {
        title: "",
        description: "",
        location: "",
        visibilityTypeId: null,
        feelingTypeId: null,
      },
      fields: [
        { key: "title", label: "Title", type: "text", required: true, rules: [rules.required], placeholder: "Title" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Description" },
        { key: "location", label: "Location", type: "text", placeholder: "Location" },
        {
          key: "visibilityTypeId",
          label: "Visibility",
          type: "select",
          required: true,
          rules: [rules.required],
          optionsApi: "/visibilityTypes",
        },
        {
          key: "feelingTypeId",
          label: "Feeling",
          type: "select",
          optionsApi: "/feelingTypes",
          clearable: true,
        },
        { key: "image", label: "Image", type: "imageUpload" },
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
