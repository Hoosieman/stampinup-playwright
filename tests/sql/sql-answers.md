# SQL Interview Questions & Answers

## Table Schemas

**Customers Table:**
| Column | Type |
|--------|------|
| CustomerId | INT (PK) |
| Name | VARCHAR |
| Email | VARCHAR |

**Orders Table:**
| Column | Type |
|--------|------|
| OrderId | INT (PK) |
| CustomerId | INT (FK) |
| OrderDate | DATE |
| Status | VARCHAR |
| Total | DECIMAL |

---

## Question 1: Find Failed Orders in Last 30 Days

**Question:** Given an Orders table with columns OrderId, CustomerId, OrderDate, Status, and Total, write a query to find all orders placed in the last 30 days with a status of 'Failed'.

**Answer:**
```sql
SELECT OrderId, CustomerId, OrderDate, Status, Total
FROM Orders
WHERE Status = 'Failed'
  AND OrderDate >= DATEADD(DAY, -30, GETDATE());
```

**Alternative (MySQL):**
```sql
SELECT OrderId, CustomerId, OrderDate, Status, Total
FROM Orders
WHERE Status = 'Failed'
  AND OrderDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

**Alternative (PostgreSQL):**
```sql
SELECT OrderId, CustomerId, OrderDate, Status, Total
FROM Orders
WHERE Status = 'Failed'
  AND OrderDate >= CURRENT_DATE - INTERVAL '30 days';
```

---

## Question 2: Join Customers and Orders Over $100

**Question:** Given a Customers table (CustomerId, Name, Email) and the Orders table above, write a query that returns the customer name, email, and order total for all orders over $100.

**Answer:**
```sql
SELECT c.Name, c.Email, o.Total
FROM Customers c
INNER JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.Total > 100;
```

**Explanation:**
- Use `INNER JOIN` to combine customers with their orders
- Filter with `WHERE o.Total > 100` to only include orders exceeding $100
- Only customers who have placed orders over $100 will appear in results

---

## Question 3: Count Orders Per Customer (Including Zero)

**Question:** Using the same tables, write a query that returns how many orders each customer has placed. Include customers who have placed zero orders.

**Answer:**
```sql
SELECT c.CustomerId, c.Name, c.Email, COUNT(o.OrderId) AS OrderCount
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
GROUP BY c.CustomerId, c.Name, c.Email;
```

**Explanation:**
- Use `LEFT JOIN` to include ALL customers, even those without orders
- `COUNT(o.OrderId)` counts only non-NULL OrderIds (returns 0 for customers with no orders)
- `GROUP BY` groups results by customer so we get one row per customer
- If we used `COUNT(*)` instead, customers with no orders would show 1 instead of 0

---

## Question 4: Debug the Query

**Question:** Here's a query that's supposed to return all customers who have never placed an order, but it's returning zero rows even though we know some exist. What's wrong?

```sql
SELECT c.Name, c.Email
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.Status = 'Completed';
```

**Answer:** The `WHERE` clause filters out all customers who have never placed an order.

**The Problem:**
- `LEFT JOIN` correctly includes customers with no orders (their order columns are NULL)
- But `WHERE o.Status = 'Completed'` eliminates rows where `o.Status` is NULL
- Customers with no orders have NULL for all order columns, so they get filtered out
- The query ends up behaving like an `INNER JOIN`

**Corrected Query (to find customers who never placed an order):**
```sql
SELECT c.Name, c.Email
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.OrderId IS NULL;
```

**Explanation:**
- After the `LEFT JOIN`, customers with no orders will have NULL values in all order columns
- `WHERE o.OrderId IS NULL` keeps only those rows where no matching order was found
- This correctly returns customers who have never placed an order

**Alternative using NOT EXISTS:**
```sql
SELECT c.Name, c.Email
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1 
    FROM Orders o 
    WHERE o.CustomerId = c.CustomerId
);
```

---

## Key Concepts Summary

| Concept | Use Case |
|---------|----------|
| `INNER JOIN` | Only matching rows from both tables |
| `LEFT JOIN` | All rows from left table, matching from right (NULL if no match) |
| `COUNT(column)` | Counts non-NULL values only |
| `COUNT(*)` | Counts all rows including NULLs |
| `WHERE` after `LEFT JOIN` | Can accidentally filter out NULL rows, negating the LEFT JOIN |
| `IS NULL` check | Use to find non-matching rows after LEFT JOIN |
