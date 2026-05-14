# User

```ts
User {
  id
  username
  email
  password

  display_name
  age
  city
  bio

  instruments[]
  genres[]
  influences[]

  experience_level

  goals[]

  profile_picture

  created_at
}
```

# Swipe

```ts
Swipe {
  id
  from_user_id
  to_user_id
  action
  created_at
}
```

# Match

```ts
Match {
  id
  user_1_id
  user_2_id
  created_at
}
```

# Message

```ts
Message {
  id
  match_id
  sender_id
  content
  created_at
}
```