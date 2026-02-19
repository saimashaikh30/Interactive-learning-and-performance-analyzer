"""updated migration

Revision ID: ded36a3b7cb2
Revises: 7008a1c2fde8
Create Date: 2026-02-18 13:09:14.498121

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ded36a3b7cb2'
down_revision = '7008a1c2fde8'
branch_labels = None
depends_on = None


# Define the enum type
user_role_enum = sa.Enum('admin', 'superadmin', 'user', name='user_role_enum')


def upgrade():
    # Step 1: Create the enum type in PostgreSQL
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # Step 2: Add the column with a temporary server default to avoid NULLs in existing rows
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'role',
                user_role_enum,
                nullable=False,
                server_default='user'  # default for existing rows
            )
        )

    # Step 3: Remove the server default so new inserts don't automatically get it
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('role', server_default=None)


def downgrade():
    # Step 1: Drop the column
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('role')

    # Step 2: Drop the enum type
    user_role_enum.drop(op.get_bind(), checkfirst=True)
