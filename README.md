# POS & Inventory Management System

## Firebase Setup & Deployment

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project
```bash
firebase init
```

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 6. Deploy to Firebase Hosting (Optional)
```bash
npm run build
firebase deploy --only hosting
```

## Firestore Security Rules

### Overview
The security rules ensure that:
- Only authenticated users can access data
- Users can only access their own data
- Data validation is enforced on all writes
- Proper data structure is maintained

### Rule Structure
```
/artifacts/{appId}/users/{userId}/
├── settings/
├── products/
├── customers/
├── sales/
└── user profile
```

### Key Security Features

#### 1. User Isolation
- Each user can only access data under their own `userId`
- Cross-user data access is completely blocked

#### 2. Data Validation
- **Settings**: Validates store name, contact info, preferences
- **Products**: Validates name, price, stock, category
- **Customers**: Validates name and contact information
- **Sales**: Validates transaction data and structure

#### 3. Field Validation
- String length limits (names: 200 chars, categories: 100 chars)
- Number validation (prices, stock must be >= 0)
- Required field enforcement
- Optional field handling

#### 4. Type Safety
- Enforces correct data types (string, number, boolean, timestamp)
- Validates nested objects (discount, tax, customer in sales)
- Array validation for sales items

### Settings Validation Rules

#### Required Fields
- `storeName`: String, 1-100 characters

#### Optional Fields
- `storeAddress`, `storePhone`, `storeEmail`: Strings
- `logoUrl`: String (URL)
- `currency`: String (IDR, USD, EUR)
- `taxRate`: Number (percentage)
- `receiptFooter`: String
- `theme`: String (light, dark, auto)
- `language`: String (id, en)
- `autoBackup`: Boolean
- `lowStockAlert`: Number

### Product Validation Rules

#### Required Fields
- `name`: String, 1-200 characters
- `category`: String, 1-100 characters
- `price`: Number >= 0
- `costPrice`: Number >= 0
- `stock`: Number >= 0

#### Optional Fields
- `brand`: String
- `icon`: String (FontAwesome class)
- `iconColor`: String (hex color)

### Customer Validation Rules

#### Required Fields
- `name`: String, 1-200 characters

#### Optional Fields
- `phone`, `email`, `gender`, `address`: Strings
- `wallet`: Number >= 0

### Sales Validation Rules

#### Required Fields
- `date`: Timestamp
- `items`: Array (non-empty)
- `subtotal`: Number >= 0
- `finalTotal`: Number >= 0
- `paymentMethod`: String (non-empty)

#### Optional Fields
- `discount`: Map/Object
- `tax`: Map/Object
- `customer`: Map/Object

## Deployment Commands

### Deploy Rules Only
```bash
firebase deploy --only firestore:rules
```

### Deploy Indexes Only
```bash
firebase deploy --only firestore:indexes
```

### Deploy Everything
```bash
firebase deploy
```

### Test Rules Locally
```bash
firebase emulators:start --only firestore
```

## Security Best Practices

1. **Always authenticate users** before allowing data access
2. **Validate all input data** to prevent malicious data
3. **Use least privilege principle** - users only access their own data
4. **Implement proper indexes** for query performance
5. **Regular security audits** of rules and data access patterns

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check if user is authenticated
   - Verify userId matches auth.uid
   - Ensure rules are deployed

2. **Validation Errors**
   - Check required fields are present
   - Verify data types match rules
   - Ensure field length limits

3. **Index Errors**
   - Deploy firestore indexes
   - Check query structure matches indexes

### Debug Commands
```bash
# Check current rules
firebase firestore:rules:get

# Validate rules syntax
firebase firestore:rules:validate

# Test rules with emulator
firebase emulators:start --only firestore
```