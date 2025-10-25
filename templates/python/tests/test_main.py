"""Unit tests for the <%= packageSrcDirName %> module."""

from <%= packageSrcDirName %> import add, hello, multiply


def test_hello():
    """Test the hello function."""
    assert hello('World!') == 'Hello World!'


def test_add():
    """Test the add function."""
    assert add(1, 2) == 3


def test_multiply():
    """Test the multiply function."""
    assert multiply(2.5, 2) == 5
